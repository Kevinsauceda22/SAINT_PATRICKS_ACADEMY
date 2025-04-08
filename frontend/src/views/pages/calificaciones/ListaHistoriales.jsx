import React, { useEffect, useState, useRef } from 'react'
import { CSidebarNav } from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import {
  cilSearch,
  cilBrushAlt,
  cilPen,
  cilTrash,
  cilFile,
  cilSpreadsheet,
  cilPlus,
  cilSave,
  cilArrowLeft,
  cilDescription,
} from '@coreui/icons'
import Swal from 'sweetalert2' // Importa SweetAlert2
import {
  CButton,
  CContainer,
  CForm,
  CPagination,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTable,
  CRow,
  CCol,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'

import usePermission from '../../../../context/usePermission'
import AccessDenied from '../AccessDenied/AccessDenied'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { saveAs } from 'file-saver'
import logo from 'src/assets/brand/logo_saint_patrick.png'
import * as XLSX from 'xlsx'
import * as jwt_decode from 'jwt-decode'

const ListaHistoriales = () => {
  const { canSelect, canDelete, canInsert, canUpdate } = usePermission('ListaHistoriales')
  const [historiales, setHistoriales] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1) // Estado para la página actual
  const [itemsPerPage, setItemsPerPage] = useState(5) // Estado para los elementos por página
  const [GradosMatricula, setGradosMatricula] = useState([])
  const [Grados, setGrados] = useState([])
  const [currentView, setCurrentView] = useState('grados')
  const [sortConfig, setSortConfig] = useState({ key: 'Nombre_grado', direction: 'asc' })
  const [verEstudiantes, setverSestudiantes] = useState(false)
  const [gradoSeleccionado, setGradoSeleccionado] = useState(null) // Almacena el grado seleccionado
  const [Estudiantes, setEstudiantes] = useState([])
  const [verHistoriales, setVerHistoriales] = useState(false)
  const [Instituto, setInstituto] = useState([])
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false)
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false)
  const [historialAEditar, setHistorialAEditar] = useState(null)
  const [historialToDelete, setHistorialToDelete] = useState(null)
  const inputRef = useRef(null) // Referencia para el input
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false) // Estado para detectar cambios sin guardar
  const resetNuevoHistorial = () => setNuevoHistorial('')

  const [estadonota, setEstadonota] = useState([]) // Inicializa el estado como un arreglo vacío
  const [Persona, setPersona] = useState([])
  const [selectedEstudiante, setSelectedEstudiante] = useState(null) // Estudiante seleccionado
  const [nuevoHistorial, setNuevoHistorial] = useState({
    Cod_persona: selectedEstudiante?.Cod_persona || '', // Preseleccionado
    Cod_grado: '', // Preseleccionado
    Cod_estado: '',
    Año_Academico: '',
    Promedio_Anual: '',
    Cod_Instituto: '',
    Observacion: '',
  })

  useEffect(() => {
    fetchPersonas()
    fetchGrados()
    fetchInstituto()
    fetchGradosMatricula()
    fetchPersonasPorGrado()
    fetchHistorialAcademicoporPersona()
    fetchEstadoNota()
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decodedToken = jwt_decode(token) // Usamos jwt_decode para decodificar el token
        console.log('Token decodificado:', decodedToken)

        // Aquí puedes realizar otras acciones, como verificar si el token es válido o si el usuario tiene permisos
      } catch (error) {
        console.error('Error al decodificar el token:', error)
      }
    }
  }, [])

  const openDeleteModal = (persona) => {
    setHistorialToDelete(persona) // Asigna el historial que se va a eliminar
    setModalDeleteVisible(true) // Muestra el modal
  }

  const openUpdateModal = (persona) => {
    setHistorialAEditar(persona) // Almacenar los datos del historial a editar
    setModalUpdateVisible(true) // Mostrar el modal de actualización
  }

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
          closeFunction(false)
          resetFields() // Limpiar los campos al cerrar
          setHasUnsavedChanges(false) // Resetear cambios no guardados
        }
      })
    } else {
      closeFunction(false)
      resetFields()
      setHasUnsavedChanges(false) // Asegurarse de resetear aquí también
    }
  }

  const fetchPersonas = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/persona/verPersonas')
      const data = await response.json()
      setPersona(data)
    } catch (error) {
      console.error('Error al obtener los estudiantes: ', error)
    }
  }

  const fetchGrados = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/grados/verGrados')
      const data = await response.json()
      // Asignar un índice original basado en el orden en la base de datos
      const dataWithIndex = data.map((grado, index) => ({
        ...grado,
        originalIndex: index + 1, // Guardamos la secuencia original
      }))

      setGrados(dataWithIndex)
    } catch (error) {
      console.error('Error al obtener los grados:', error)
    }
  }

  const fetchGradosMatricula = async () => {
    try {
      // Hacer la solicitud al endpoint de grados
      const response = await fetch('http://localhost:4000/api/historialAcademico/gradosMatricula')

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error('Error en la solicitud al servidor')
      }

      // Parsear la respuesta JSON
      const data = await response.json()

      // Manejar los datos obtenidos
      setGradosMatricula(data.data) // Asignar los datos al estado de grados (suponiendo que tienes un estado)
    } catch (error) {
      console.error('Error al obtener los grados:', error)
    }
  }

  const fetchEstadoNota = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/historialAcademico/estado')

      if (response.ok) {
        const data = await response.json()
        setEstadonota(data)
      } else {
        console.error('Error al obtener los datos:', response.statusText)
      }
    } catch (error) {
      console.error('Error de red:', error)
    }
  }

  const fetchPersonasPorGrado = async (codGrado, Anio_academico) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `http://localhost:4000/api/historialAcademico/gradosMatricula/${codGrado}/${Anio_academico}`,
      )
      if (!response.ok) throw new Error('Error al obtener las personas del grado')
      const data = await response.json()
      setEstudiantes(data.data || []) // Asegura que Estudiantes sea un array si no hay datos anio_academico
    } catch (err) {
      setError('Error al cargar los datos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistorialAcademicoporPersona = async (Cod_persona) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/historialAcademico/gradosMatricula/${Cod_persona}`,
      )

      if (!response.ok) {
        throw new Error('Error al obtener el historial')
      }

      const data = await response.json()

      // Acceder solo al primer array, que contiene los historiales
      const historiales = data.data && Array.isArray(data.data[0]) ? data.data[0] : []

      // Verifica si el array de historiales tiene datos
      if (historiales.length > 0) {
        setHistoriales(historiales) // Establece el estado con los historiales
      } else {
        setHistoriales([]) // En caso de que no haya historiales
      }
    } catch (err) {
      setError('Error al cargar los datos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const [recordsPerPage2, setRecordsPerPage2] = useState(5)
  const [searchTerm2, setSearchTerm2] = useState('')
  const [currentPage2, setCurrentPage2] = useState(1)

  const handleSearch2 = (event) => {
    const input = event.target.value.toUpperCase()
    const regex = /^[A-Z0-9ÑÁÉÍÓÚ\s]*$/ // Permite letras, números, espacios y la letra "Ñ"

    if (!regex.test(input)) {
      Swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras y espacios.',
      })
      return
    }
    setSearchTerm2(input)
    setCurrentPage2(1) // Resetear a la primera página al buscar
  }

  const ordenGrados = [
    'PRIMER GRADO',
    'SEGUNDO GRADO',
    'TERCER GRADO',
    'CUARTO GRADO',
    'QUINTO GRADO',
    'SEXTO GRADO',
    'SÉPTIMO GRADO',
    'OCTAVO GRADO',
    'NOVENO GRADO',
    'DÉCIMO',
    'UNDÉCIMO',
    'DUODÉCIMO',
  ]

  const filteredGrados = GradosMatricula.filter((record) => {
    // Asegurarse de que el año académico exista y convertirlo a cadena
    const anio = record.Anio_academico ? record.Anio_academico.toString() : '';
    
    // Comprueba si el año contiene el término de búsqueda
    const matchesAnio = anio.includes(searchTerm2);
    
    // Si el término es "1", se puede imprimir el registro para depuración (opcional)
    if (searchTerm2 === '1' && matchesAnio) {
      console.log('Registro que coincide con "1" por año:', record);
    }
    
    return matchesAnio;
  });
  

  // 2. Eliminar duplicados (usando la variable correcta: filteredGrados)
  const uniqueRecords = filteredGrados.filter(
    (record, index, self) => index === self.findIndex((r) => r.Cod_grado === record.Cod_grado),
  )

  // 3. Ordenar los registros únicos según el orden definido
  const gradosOrdenados = [...uniqueRecords].sort((a, b) => {
    const indexA = ordenGrados.indexOf(a.Nombre_grado)
    const indexB = ordenGrados.indexOf(b.Nombre_grado)
    return (
      (indexA === -1 ? ordenGrados.length : indexA) - (indexB === -1 ? ordenGrados.length : indexB)
    )
  })

  // 4. Aplicar la paginación sobre los registros ordenados
  const indexOfLastRecord2 = currentPage2 * recordsPerPage2
  const indexOfFirstRecord2 = indexOfLastRecord2 - recordsPerPage2
  const currentRecords2 = gradosOrdenados.slice(indexOfFirstRecord2, indexOfLastRecord2)
  // Cambiar página

  const paginate2 = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredGrados.length / recordsPerPage2)) {
      setCurrentPage2(pageNumber)
    }
  }

  const [recordsPerPage3, setRecordsPerPage3] = useState(5)
  const [searchTerm3, setSearchTerm3] = useState('')
  const [currentPage3, setCurrentPage3] = useState(1)

  const handleSearch3 = (event) => {
    const input = event.target.value.toUpperCase()
    const regex = /^[A-ZÑ\s]*$/ // Solo permite letras, espacios y la letra "Ñ"

    if (!regex.test(input)) {
      Swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras y espacios.',
      })
      return
    }
    setSearchTerm3(input)
    setCurrentPage3(1) // Resetear a la primera página al buscar
  }

  // Filtro de búsqueda
  const filteredEstudiantes = Estudiantes.filter((persona) =>
    Object.values({
      PNombre_persona: persona.PNombre_persona,
      SNombre_persona: persona.SNombre_persona,
      PApellido_persona: persona.PApellido_persona,
      SApellido_persona: persona.SApellido_persona,
    }).some((value) => value?.toLowerCase().includes(searchTerm3.toLowerCase())),
  )

  // Lógica de paginación
  const indexOfLastRecord3 = currentPage3 * recordsPerPage3
  const indexOfFirstRecord3 = indexOfLastRecord3 - recordsPerPage3
  const currentRecords3 = filteredEstudiantes.slice(indexOfFirstRecord3, indexOfLastRecord3)

  // Cambiar página
  const paginate3 = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredEstudiantes.length / recordsPerPage3)) {
      setCurrentPage3(pageNumber)
    }
  }

  //

  const [recordsPerPage4, setRecordsPerPage4] = useState(5)
  const [searchTerm4, setSearchTerm4] = useState('')
  const [currentPage4, setCurrentPage4] = useState(1)

  const handleSearch4 = (event) => {
    const input = event.target.value.toUpperCase()
    const regex = /^[A-ZÑÁÉÍÓÚ\s]*$/ // Solo permite letras, espacios y la letra "Ñ"

    if (!regex.test(input)) {
      Swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras y espacios.',
      })
      return
    }
    setSearchTerm4(input)
    setCurrentPage4(1) // Resetear a la primera página al buscar
  }
  const filteredhistoriales = (historiales || []).filter(
    (historial) =>
      typeof historial.Nombre_grado === 'string' &&
      historial.Nombre_grado.toLowerCase().includes(searchTerm4.toLowerCase()),
  )

  // Lógica de paginación
  const indexOfLastRecord4 = currentPage4 * recordsPerPage4
  const indexOfFirstRecord4 = indexOfLastRecord4 - recordsPerPage4
  const currentRecords4 = filteredhistoriales.slice(indexOfFirstRecord4, indexOfLastRecord4)

  // Cambiar página
  const paginate4 = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredhistoriales.length / recordsPerPage4)) {
      setCurrentPage4(pageNumber)
    }
  }

  const handleVerEstudiante = () => {
    // Cambiar el estado para mostrar la vista de estudiantes
    setverSestudiantes(true)
  }

  const handleVolver = () => {
    // Cambiar el estado para volver a la vista de historiales
    setverSestudiantes(false)
  }

  // Función para cambiar de vista a los historiales de un estudiante
  // Función para cambiar de vista a los historiales de un estudiante
  const handleVerHistoriales = async (persona) => {
    // Establecer el estudiante seleccionado
    setSelectedEstudiante(persona)

    // Limpiar los historiales anteriores
    setHistoriales([])

    // Asegurarse de que Cod_persona esté asignado en el nuevo historial
    setNuevoHistorial((prev) => ({
      ...prev,
      Cod_persona: persona.Cod_persona, // Se asegura de que Cod_persona esté asignado
    }))

    // Cargar los historiales del estudiante
    try {
      await fetchHistorialAcademicoporPersona(persona.Cod_persona)

      // Cambiar la vista solo después de que los historiales se hayan cargado
      setCurrentView('historiales')
    } catch (error) {
      console.error('Error al cargar los historiales:', error)
      Swal.fire('Error', 'Hubo un problema al cargar los historiales del estudiante.', 'error')
    }
  }

  const handleVolverAEstudiantes = () => {
    setVerHistoriales(false)
    setEstudianteSeleccionado(null)
  }

  const fetchInstituto = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/instituto/instituto')
      const data = await response.json()
      setInstituto(data)
    } catch (error) {
      console.error('Error al obtener los institutos: ', error)
    }
  }

  const fetchHistorial = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/historialAcademico/historiales')
      const data = await response.json()

      // Renumera los historiales secuencialmente
      const historialesNumerados = data.map((historial, index) => ({
        ...historial,
      }))

      setHistoriales(historialesNumerados)
    } catch (error) {
      console.error('Error al obtener los historiales:', error)
    }
  }

  const generarReporteGradosPDF = () => {
    // Validar que haya datos en la tabla
    if (!gradosOrdenados || gradosOrdenados.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Tabla vacía',
        text: 'No hay datos disponibles para generar el reporte.',
        confirmButtonText: 'Aceptar',
      })
      return // Salir de la función si no hay datos
    }

    const doc = new jsPDF()
    const img = new Image()
    img.src = logo // Asegúrate de importar el logo correctamente

    img.onload = () => {
      // Agregar logo
      doc.addImage(img, 'PNG', 10, 10, 30, 30)

      let yPosition = 20

      // Título principal
      doc.setFontSize(18)
      doc.setTextColor(0, 102, 51)
      doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, yPosition, {
        align: 'center',
      })

      yPosition += 12

      // Subtítulo
      doc.setFontSize(16)
      doc.text('REPORTE DE GRADOS', doc.internal.pageSize.width / 2, yPosition, {
        align: 'center',
      })
      yPosition += 10

      // Información adicional
      doc.setFontSize(10)
      doc.setTextColor(100) // Gris para texto secundario
      doc.text(
        'Casa Club del periodista, Colonia del Periodista',
        doc.internal.pageSize.width / 2,
        yPosition,
        { align: 'center' },
      )

      yPosition += 4

      doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, yPosition, {
        align: 'center',
      })

      yPosition += 4

      doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, yPosition, {
        align: 'center',
      })

      yPosition += 6 // Espaciado antes de la línea divisoria

      // Línea divisoria
      doc.setLineWidth(0.5)
      doc.setDrawColor(0, 102, 51)
      doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition)

      // Configuración para la tabla
      const pageHeight = doc.internal.pageSize.height // Altura de la página
      let pageNumber = 1 // Página inicial

      doc.autoTable({
        startY: yPosition + 4,
        head: [
          ['#', 'Nombre del Grado', 'Nombre de Seccion', 'Nombre de Profesor', 'Año academico'],
        ],
        body: gradosOrdenados.map((gradoM, index) => [
          index + 1, // Mostrar índice
          gradoM.Nombre_grado, // Mostrar el nombre del grado
          gradoM.Nombre_seccion, // Mostrar el nombre del grado
          gradoM.Nombre_Completo, // Mostrar el nombre del grado
          gradoM.Anio_academico, // Mostrar el nombre del grado
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
          1: { cellWidth: 'auto' }, // Columna 'Nombre del grado' se ajusta automáticamente
        },
        alternateRowStyles: { fillColor: [240, 248, 255] },
        didDrawPage: (data) => {
          const currentDate = new Date()
          const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`
          doc.setFontSize(10)
          doc.setTextColor(100)
          // Fecha y hora en el pie de página
          doc.text(`Fecha y hora de generación: ${formattedDate}`, 10, pageHeight - 10)
        },
      })

      // Asegúrate de calcular el total de páginas al final
      const totalPages = doc.internal.getNumberOfPages()
      const pageWidth = doc.internal.pageSize.width // Ancho de la página

      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i) // Ve a cada página
        doc.setTextColor(100)
        const text = `Página ${i} de ${totalPages}`
        // Agrega número de página en la posición correcta
        doc.text(text, pageWidth - 30, pageHeight - 10)
      }

      // Abrir el PDF
      window.open(doc.output('bloburl'), '_blank')
    }

    img.onerror = () => {
      console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.')
      window.open(doc.output('bloburl'), '_blank')
    }
  }

  const generarReporteGradosExcel = () => {
    // Encabezados iniciales del reporte
    const encabezados = [
      ['Saint Patrick Academy'],
      ['Reporte de Grados'],
      [`Fecha de generación: ${new Date().toLocaleDateString()}`],
      [], // Espacio en blanco
    ]

    // Encabezados de la tabla
    encabezados.push([
      '#',
      'Nombre del Grado',
      'Nombre de Seccion',
      'Nombre de Profesor',
      'Año academico',
    ])

    // Crear filas de la tabla con los datos de los grados
    const filas = gradosOrdenados.map((gradoM, index) => [
      index + 1, // Mostrar índice
      gradoM.Nombre_grado, // Nombre del grado
      gradoM.Nombre_seccion, // Nombre del grado
      gradoM.Nombre_Completo, // Nombre del grado
      gradoM.Anio_academico, // Nombre del grado
    ])

    // Combinar encabezados y filas
    const datos = [...encabezados, ...filas]

    // Crear una hoja de trabajo con los datos
    const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos)

    // Ajustar el ancho de columnas automáticamente
    const ajusteColumnas = [
      { wpx: 50 }, // Número
      { wpx: 200 }, // Nombre del Grado
      { wpx: 100 }, // Nombre del Grado
      { wpx: 200 }, // Nombre del Grado
      { wpx: 100 }, // Nombre del Grado
    ]
    hojaDeTrabajo['!cols'] = ajusteColumnas

    // Crear un libro de trabajo y añadir la hoja
    const libroDeTrabajo = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, 'Reporte de Grados')

    // Guardar el archivo Excel
    const nombreArchivo = `reporte_grados_${new Date()
      .toLocaleDateString()
      .replace(/\//g, '-')}.xlsx`
    XLSX.writeFile(libroDeTrabajo, nombreArchivo)
  }

  // Función para obtener el nombre de una persona basado en cod_persona
  const getNombrePersona = (cod_persona) => {
    const persona = Persona.find((p) => String(p.cod_persona) === String(cod_persona))
    return persona
      ? `${persona.Nombre} ${persona.Segundo_nombre || ''} ${persona.Primer_apellido} ${persona.Segundo_Apellido || ''}`.trim()
      : 'Desconocido'
  }

  // Suponiendo que tienes un array de estados, por ejemplo, `estadoNotas`
  const estadoNotas = [
    { Cod_estado: 1, Descripcion: 'Aprobado' },
    { Cod_estado: 2, Descripcion: 'Reprobado' },
    // ... otros estados
  ]

  // Función para obtener la descripción de un estado
  const getDescripcionEstado = (cod_estado) => {
    const estado = estadoNotas.find((e) => e.Cod_estado === cod_estado)
    return estado ? estado.Descripcion : 'Estado desconocido'
  }
  const generarReportePersonasPDF = () => {
    // Validar que haya datos en la tabla
    if (!currentRecords3 || currentRecords3.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Tabla vacía',
        text: 'No hay datos disponibles para generar el reporte.',
        confirmButtonText: 'Aceptar',
      })
      return // Salir de la función si no hay datos
    }

    const doc = new jsPDF()
    const img = new Image()
    img.src = logo // Asegúrate de importar el logo correctamente

    img.onload = () => {
      // Agregar logo
      doc.addImage(img, 'PNG', 10, 10, 30, 30)

      let yPosition = 20

      // Título principal
      doc.setFontSize(18)
      doc.setTextColor(0, 102, 51)
      doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, yPosition, {
        align: 'center',
      })

      yPosition += 12

      // Subtítulo
      doc.setFontSize(16)
      doc.text(
        `REPORTE DE ESTUDIANTES DEL ${gradoSeleccionado?.Nombre_grado}`,
        doc.internal.pageSize.width / 2,
        yPosition,
        {
          align: 'center',
        },
      )
      yPosition += 10

      doc.text(
        `AÑO: ${gradoSeleccionado?.Anio_academico}`,
        doc.internal.pageSize.width / 2,
        yPosition,
        {
          align: 'center',
        },
      )
      yPosition += 10

      // Información adicional
      doc.setFontSize(10)
      doc.setTextColor(100) // Gris para texto secundario
      doc.text(
        'Casa Club del periodista, Colonia del Periodista',
        doc.internal.pageSize.width / 2,
        yPosition,
        { align: 'center' },
      )

      yPosition += 4

      doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, yPosition, {
        align: 'center',
      })

      yPosition += 4

      doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, yPosition, {
        align: 'center',
      })

      yPosition += 6 // Espaciado antes de la línea divisoria

      // Línea divisoria
      doc.setLineWidth(0.5)
      doc.setDrawColor(0, 102, 51)
      doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition)

      // Configuración para la tabla
      const pageHeight = doc.internal.pageSize.height // Altura de la página
      let pageNumber = 1 // Página inicial

      doc.autoTable({
        startY: yPosition + 4,
        head: [['#', 'Nombre de Estudiantes']],
        body: currentRecords3.map((persona, index) => [
          index + 1, // Mostrar índice
          `${persona.PNombre_persona} ${persona.SNombre_persona || ''} ${persona.PApellido_persona} ${persona.SApellido_persona || ''}`.trim(), // Nombre completo
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
          1: { cellWidth: 'auto' }, // Columna 'Nombre de la Persona' se ajusta automáticamente
        },
        alternateRowStyles: { fillColor: [240, 248, 255] },
        didDrawPage: (data) => {
          const currentDate = new Date()
          const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`
          const pageHeight = doc.internal.pageSize.height // Altura de la página
          doc.setFontSize(10)
          doc.setTextColor(100)
          // Fecha y hora en el pie de página
          doc.text(`Fecha y hora de generación: ${formattedDate}`, 10, pageHeight - 10)
        },
      })

      // Asegúrate de calcular el total de páginas al final
      const totalPages = doc.internal.getNumberOfPages()
      const pageWidth = doc.internal.pageSize.width // Ancho de la página

      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i) // Ve a cada página
        doc.setTextColor(100)
        const text = `Página ${i} de ${totalPages}`
        // Agrega número de página en la posición correcta
        doc.text(text, pageWidth - 30, pageHeight - 10)
      }

      // Abrir el PDF
      window.open(doc.output('bloburl'), '_blank')
    }

    img.onerror = () => {
      console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.')
      window.open(doc.output('bloburl'), '_blank')
    }
  }

  console.log(historiales)

  const generarReporteHistorialPDF = () => {
    if (!historiales || historiales.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Tabla vacía',
        text: 'No hay datos disponibles para generar el reporte.',
        confirmButtonText: 'Aceptar',
      })
      return // Salir de la función si no hay datos
    }

    const doc = new jsPDF()
    const img = new Image()
    img.src = logo // Asegúrate de importar el logo correctamente

    img.onload = () => {
      // Agregar logo
      doc.addImage(img, 'PNG', 10, 10, 30, 30)

      let yPosition = 20

      // Título principal
      doc.setFontSize(18)
      doc.setTextColor(0, 102, 51)
      doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, yPosition, {
        align: 'center',
      })

      yPosition += 12

      // Subtítulo
      doc.setFontSize(16)
      doc.text(
        `REPORTE DE HISTORIALES ACADEMICOS`.trim(),
        doc.internal.pageSize.width / 2,
        yPosition,
        { align: 'center' },
      )
      yPosition += 10

      doc.setFontSize(12)
      doc.text(
        `ESTUDIANTE: ${selectedEstudiante.PNombre_persona} ${selectedEstudiante.SNombre_persona || ''} ${selectedEstudiante.PApellido_persona} ${selectedEstudiante.SApellido_persona || ''}`.trim(),
        doc.internal.pageSize.width / 2,
        yPosition,
        { align: 'center' },
      )
      yPosition += 10

      // Información adicional
      doc.setFontSize(10)
      doc.setTextColor(100) // Gris para texto secundario
      doc.text(
        'Casa Club del periodista, Colonia del Periodista',
        doc.internal.pageSize.width / 2,
        yPosition,
        { align: 'center' },
      )

      yPosition += 4

      doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, yPosition, {
        align: 'center',
      })

      yPosition += 4

      doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, yPosition, {
        align: 'center',
      })

      yPosition += 6 // Espaciado antes de la línea divisoria

      // Línea divisoria
      doc.setLineWidth(0.5)
      doc.setDrawColor(0, 102, 51)
      doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition)

      // Configuración para la tabla
      const pageHeight = doc.internal.pageSize.height // Altura de la página
      let pageNumber = 1 // Página inicial

      doc.autoTable({
        startY: yPosition + 4,
        head: [
          [
            '#',
            'Nombre Completo',
            'Grado',
            'Año Académico',
            'Instituto',
            'Promedio',
            'Estado',
            'Observación',
          ],
        ],
        body: historiales.map((persona, index) => [
          index + 1, // Mostrar índice
          persona.Nombre_completo_persona, // Nombre completo
          persona.Nombre_grado, // Grado
          persona.Año_Academico.toString(), // Año académico
          persona.Nom_Instituto, // Instituto
          persona.Promedio_Anual.toString(), // Promedio anual
          persona.Estado_historial, // Estado del historial
          persona.Observacion || 'N/A', // Observación
        ]),
        headStyles: {
          fillColor: [0, 102, 51],
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        styles: {
          fontSize: 10,
          halign: 'center',
        },
        columnStyles: {
          0: { cellWidth: 'auto' }, // Columna '#' se ajusta automáticamente
          1: { cellWidth: 'auto' }, // Nombre completo
          2: { cellWidth: 'auto' }, // Grado
          3: { cellWidth: 'auto' }, // Año académico
          4: { cellWidth: 'auto' }, // Instituto
          5: { cellWidth: 'auto' }, // Promedio
          6: { cellWidth: 'auto' }, // Estado
          7: { cellWidth: 'auto' }, // Observación
        },
        alternateRowStyles: { fillColor: [240, 248, 255] },
        didDrawPage: (data) => {
          const currentDate = new Date()
          const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`
          const pageHeight = doc.internal.pageSize.height // Altura de la página
          doc.setFontSize(10)
          doc.setTextColor(100)
          // Fecha y hora en el pie de página
          doc.text(`Fecha y hora de generación: ${formattedDate}`, 10, pageHeight - 10)
        },
      })

      // Asegúrate de calcular el total de páginas al final
      const totalPages = doc.internal.getNumberOfPages()
      const pageWidth = doc.internal.pageSize.width // Ancho de la página

      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i) // Ve a cada página
        doc.setTextColor(100)
        const text = `Página ${i} de ${totalPages}`
        // Agrega número de página en la posición correcta
        doc.text(text, pageWidth - 30, pageHeight - 10)
      }

      // Abrir el PDF
      window.open(doc.output('bloburl'), '_blank')
    }

    img.onerror = () => {
      console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.')
      window.open(doc.output('bloburl'), '_blank')
    }
  }

  const generarReporteHistorialExcel = () => {
    if (!historiales || historiales.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Tabla vacía',
        text: 'No hay datos disponibles para generar el reporte.',
        confirmButtonText: 'Aceptar',
      })
      return // Salir de la función si no hay datos
    }

    // Encabezados iniciales del reporte
    const encabezados = [
      ['Saint Patrick Academy'],
      ['Reporte de Historiales Académicos'],
      [`Fecha de generación: ${new Date().toLocaleDateString()}`],
      [], // Espacio en blanco
    ]

    // Encabezados de la tabla
    encabezados.push([
      '#',
      'Nombre Completo',
      'Grado',
      'Año Académico',
      'Instituto',
      'Promedio',
      'Estado',
      'Observación',
    ])

    // Crear filas de la tabla con los datos de los historiales
    const filas = historiales.map((persona, index) => [
      index + 1, // Índice
      persona.Nombre_completo_persona, // Nombre completo
      persona.Nombre_grado, // Grado
      persona.Año_Academico, // Año académico
      persona.Nom_Instituto, // Instituto
      persona.Promedio_Anual, // Promedio anual
      persona.Estado_historial, // Estado
      persona.Observacion || 'N/A', // Observación
    ])

    // Combinar encabezados y filas
    const datos = [...encabezados, ...filas]

    // Crear una hoja de trabajo con los datos
    const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos)

    // Ajustar el ancho de columnas automáticamente
    const ajusteColumnas = [
      { wpx: 30 }, // Número
      { wpx: 200 }, // Nombre completo
      { wpx: 100 }, // Grado
      { wpx: 100 }, // Año académico
      { wpx: 150 }, // Instituto
      { wpx: 80 }, // Promedio
      { wpx: 100 }, // Estado
      { wpx: 200 }, // Observación
    ]
    hojaDeTrabajo['!cols'] = ajusteColumnas

    // Crear un libro de trabajo y añadir la hoja
    const libroDeTrabajo = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, 'Historiales Académicos')

    // Guardar el archivo Excel
    const nombreArchivo = `reporte_historiales_${new Date()
      .toLocaleDateString()
      .replace(/\//g, '-')}.xlsx`
    XLSX.writeFile(libroDeTrabajo, nombreArchivo)
  }

  const generarReportePersonasExcel = () => {
    // Encabezados iniciales del reporte
    const encabezados = [
      ['Saint Patrick Academy'],
      [
        'Reporte de Estudiantes del ' +
          (gradoSeleccionado?.Nombre_grado + 'del año:' + gradoSeleccionado?.Anio_academico ||
            'Grado no seleccionado'),
      ],
      [`Fecha de generación: ${new Date().toLocaleDateString()}`],
      [], // Espacio en blanco
    ]

    // Encabezados de la tabla
    encabezados.push(['#', 'Nombre del Estudiante'])

    // Crear filas de la tabla con los datos de los estudiantes
    const filas = currentRecords3.map((persona, index) => [
      index + 1, // Mostrar índice
      `${persona.PNombre_persona} ${persona.SNombre_persona || ''} ${persona.PApellido_persona} ${persona.SApellido_persona || ''}`.trim(),
    ])

    // Combinar encabezados y filas
    const datos = [...encabezados, ...filas]

    // Crear una hoja de trabajo con los datos
    const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos)

    // Ajustar el ancho de las columnas automáticamente
    const ajusteColumnas = [
      { wpx: 50 }, // Número
      { wpx: 250 }, // Nombre del Estudiante
    ]
    hojaDeTrabajo['!cols'] = ajusteColumnas

    // Crear un libro de trabajo y añadir la hoja
    const libroDeTrabajo = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, 'Reporte de Estudiantes')

    // Guardar el archivo Excel
    const nombreArchivo = `reporte_estudiantes_${new Date()
      .toLocaleDateString()
      .replace(/\//g, '-')}.xlsx`
    XLSX.writeFile(libroDeTrabajo, nombreArchivo)
  }

  // Función para obtener el nombre del instituto basado en Cod_Instituto
  const getNombreInstituto = (Cod_Instituto) => {
    const instituto = Instituto.find((i) => i.Cod_Instituto === Cod_Instituto)
    return instituto ? instituto.Nom_Instituto : 'Instituto Desconocido'
  }

  //* Paginación: calcular los índices de los elementos que se van a mostrar
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentHistoriales = filteredhistoriales.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(filteredhistoriales.length / itemsPerPage)

  const handleInputChange = (e, field) => {
    let value = e.target.value

    setHasUnsavedChanges(true) // Resetear cambios no guardados

    // Validación para el campo Promedio_Anual
    if (field === 'Promedio_Anual') {
      const validNumber = /^[0-9]*\.?[0-9]*$/
      // Verificar si el valor ingresado es un número válido
      if (value && !validNumber.test(value)) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'Por favor ingrese un valor numérico válido, incluyendo un punto decimal.',
          confirmButtonColor: '#4B6251', // Color del botón
        })
        return
      }

      // Convertir el valor a un número flotante para compararlo
      const floatValue = parseFloat(value)

      // Validar que el valor esté entre 70 y 100 mientras se escribe
      if (value !== '' && (floatValue < 0 || floatValue > 100)) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'El Promedio Anual debe estar entre 70 y 100.',
          confirmButtonColor: '#4B6251',
        })
        return
      }
    }

    // Convertir todo a mayúsculas si es el campo Observacion
    if (field === 'Observacion') {
      value = value.toUpperCase()
      value = value.replace(/\s+/g, ' ') // Asegura que los espacios se manejen correctamente
    }

    // Validación para el campo Observacion
    if (field === 'Observacion') {
      const validCharacters = /^[A-Z0-9\s.,()]+$/ // Letras, números, espacio, ., ,, -, _, (, )
      if (value && !validCharacters.test(value)) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'El campo de observaciones solo puede contener letras, números y los caracteres permitidos',
          confirmButtonColor: '#4B6251',
        })
        return
      }
    }

    // Si todo está bien, actualiza el estado
    setError('')
    setNuevoHistorial({ ...nuevoHistorial, [field]: value })
    setHistorialAEditar({ ...historialAEditar, [field]: value })
  }

  const HistorialesSearch = () => {
    const [searchTerm, setSearchTerm] = useState('') // Definimos el estado para el término de búsqueda
  }

  const handleClearSearch = () => {
    setSearchTerm('') // Limpiar el término de búsqueda
  }

  const validateFields = () => {
    const { Año_Academico, Promedio_Anual, Cod_Instituto, Cod_grado } = nuevoHistorial

    if (!Año_Academico) {
      Swal.fire('Advertencia', 'Debe seleccionar un año académico.', 'error')
      return false
    }
    if (!Cod_grado) {
      Swal.fire('Advertencia', 'Debe seleccionar un grado.', 'error')
      return false
    }
    if (!Cod_Instituto) {
      Swal.fire('Advertencia', 'Debe seleccionar un instituto.', 'error')
      return false
    }
    if (!Promedio_Anual || isNaN(Promedio_Anual)) {
      Swal.fire('Advertencia', 'Debe ingresar un promedio anual válido.', 'error')
      return false
    }
    // Verifica que el promedio esté entre 70 y 100
    if (Promedio_Anual < 70 || Promedio_Anual > 100) {
      Swal.fire(
        'Advertencia',
        'El promedio anual del estudiante debe estar entre 70 y 100.',
        'error',
      )
      return false
    }

    return true // Todo está correcto
  }

  const validateFields2 = () => {
    const { Año_Academico, Promedio_Anual, Cod_Instituto, Cod_grado } = historialAEditar

    if (!Año_Academico) {
      Swal.fire('Advertencia', 'Debe seleccionar un año académico.', 'error')
      return false
    }
    if (!Cod_grado) {
      Swal.fire('Advertencia', 'Debe seleccionar un grado.', 'error')
      return false
    }
    if (!Cod_Instituto) {
      Swal.fire('Advertencia', 'Debe seleccionar un instituto.', 'error')
      return false
    }
    if (!Promedio_Anual || isNaN(Promedio_Anual)) {
      Swal.fire('Advertencia', 'Debe ingresar un promedio anual válido.', 'error')
      return false
    }
    // Verifica que el promedio esté entre 70 y 100
    if (Promedio_Anual < 70 || Promedio_Anual > 100) {
      Swal.fire(
        'Advertencia',
        'El promedio anual del estudiante debe estar entre 70 y 100.',
        'error',
      )
      return false
    }

    return true // Todo está correcto
  }
  const handleCreateHistorial = async () => {
    if (!selectedEstudiante?.Cod_persona) {
      Swal.fire(
        'Advertencia',
        'No se puede crear un historial sin un estudiante seleccionado.',
        'warning',
      )
      return
    }

    setNuevoHistorial((prevState) => ({
      ...prevState,
      Cod_persona: selectedEstudiante.Cod_persona,
    }))

    if (!validateFields()) {
      console.log('Campos no válidos')
      return
    }

    try {
      const response = await fetch('http://localhost:4000/api/historialAcademico/crearhistorial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoHistorial),
      })

      if (response.ok) {
        const data = await response.json()

        // Registro en la bitácora
        try {
          // Verificar si obtenemos el token correctamente
          const token = localStorage.getItem('token')
          if (!token) {
            Swal.fire('Error', 'No tienes permiso para realizar esta acción', 'error')
            return
          }

          // Decodificar el token para obtener el nombrSe del usuario
          const decodedToken = jwt_decode.jwtDecode(token)
          if (!decodedToken.cod_usuario || !decodedToken.nombre_usuario) {
            console.error('No se pudo obtener el código o el nombre de usuario del token')
            throw new Error('No se pudo obtener el código o el nombre de usuario del token')
          }

          // Descripción para la bitácora
          const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha creado un historial académico para el estudiante: ${selectedEstudiante.PNombre_persona} ${selectedEstudiante.SNombre_persona || ''} ${selectedEstudiante.PApellido_persona} ${selectedEstudiante.SApellido_persona || ''}`.trim()

          const bitacoraResponse = await fetch('http://localhost:4000/api/bitacora/registro', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              cod_usuario: decodedToken.cod_usuario,
              cod_objeto: 73, // Código del objeto correspondiente
              accion: 'INSERT', // Acción realizada
              descripcion: descripcion, // Descripción de la acción
            }),
          })

          if (!bitacoraResponse.ok) {
            throw new Error('No se pudo registrar la acción en la bitácora')
          }

          console.log('Registro en bitácora exitoso')
        } catch (bitacoraError) {
          console.error('Error al registrar en la bitácora:', bitacoraError)
          Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error')
        }

        // Mostrar mensaje de éxito
        Swal.fire('Creado', 'El historial ha sido creado correctamente.', 'success')
        await fetchHistorialAcademicoporPersona(selectedEstudiante.Cod_persona)
        setCurrentView('historiales')
        setCurrentPage(1)
        resetNuevoHistorial() // Restablecer estado del grado
        setHasUnsavedChanges(false) // Restablecer el estado de cambios no guardados
        resetForm()
        setModalVisible(false)
      } else {
        const errorData = await response.json()
        console.error('Error en la respuesta:', errorData)
        Swal.fire('Error', errorData.Mensaje || 'Error desconocido al crear el historial.', 'error')
      }
    } catch (error) {
      console.error('Error en la solicitud:', error.message)
      Swal.fire('Error', 'Hubo un problema al crear el historial: ' + error.message, 'error')
    }
  }
  const handleUpdateHistorial = async () => {
    // Validación de los campos del formulario
    if (!validateFields2()) {
      console.log('Campos no válidos');
      return;
    }
  
    // Verificar que se haya seleccionado un historial para actualizar
    if (!historialAEditar || !historialAEditar.Cod_historial_academico) {
      Swal.fire('Error', 'No se ha seleccionado un historial para actualizar.', 'error');
      return;
    }
  
    // Preparar los datos a enviar: combina el nuevoHistorial (si contiene cambios) con la información actual
    const updatedHistorial = {
      Cod_persona: selectedEstudiante.Cod_persona,
      Cod_estado: 1, // Valor fijo
      Cod_grado: nuevoHistorial.Cod_grado || historialAEditar.Cod_grado,
      Año_Academico: nuevoHistorial.Año_Academico || historialAEditar.Año_Academico,
      Promedio_Anual: nuevoHistorial.Promedio_Anual || historialAEditar.Promedio_Anual,
      Cod_Instituto: nuevoHistorial.Cod_Instituto || historialAEditar.Cod_Instituto,
      Observacion: nuevoHistorial.Observacion || historialAEditar.Observacion || 'N/A',
    };
  
    try {
      // Realizar la solicitud para actualizar el historial
      const response = await fetch('http://localhost:4000/api/historialAcademico/actualizarhistorial', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Cod_historial_academico: historialAEditar.Cod_historial_academico, // Identificador del historial a actualizar
          ...updatedHistorial,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
  
        // Registro en la bitácora
        try {
          // Obtener el token de localStorage
          const token = localStorage.getItem('token');
          if (!token) {
            Swal.fire('Error', 'No tienes permiso para realizar esta acción', 'error');
            return;
          }
  
          // Decodificar el token para obtener el código y el nombre del usuario
          const decodedToken = jwt_decode.jwtDecode(token);
          if (!decodedToken.cod_usuario || !decodedToken.nombre_usuario) {
            console.error('No se pudo obtener el código o el nombre de usuario del token');
            throw new Error('No se pudo obtener el código o el nombre de usuario del token');
          }
  
          // Construir la descripción para la bitácora
          const descripcion = (
            `El usuario: ${decodedToken.nombre_usuario} ha actualizado el historial académico para el estudiante: ` +
            `${selectedEstudiante.PNombre_persona} ${selectedEstudiante.SNombre_persona || ''} ` +
            `${selectedEstudiante.PApellido_persona} ${selectedEstudiante.SApellido_persona || ''}`
          ).trim();
  
          // Registrar la acción en la bitácora
          const bitacoraResponse = await fetch('http://localhost:4000/api/bitacora/registro', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              cod_usuario: decodedToken.cod_usuario,
              cod_objeto: 73, // Ajusta este valor según corresponda
              accion: 'UPDATE',
              descripcion: descripcion,
            }),
          });
  
          if (!bitacoraResponse.ok) {
            throw new Error('No se pudo registrar la acción en la bitácora');
          }
          console.log('Registro en bitácora exitoso');
        } catch (bitacoraError) {
          console.error('Error al registrar en la bitácora:', bitacoraError);
          Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
        }
  
        // Mostrar mensaje de éxito y actualizar la interfaz
        Swal.fire('Actualizado', 'El historial ha sido actualizado correctamente.', 'success');
        await fetchHistorialAcademicoporPersona(selectedEstudiante.Cod_persona);
        setHasUnsavedChanges(false);
        setCurrentView('historiales');
        setModalUpdateVisible(false);
      } else {
        const errorData = await response.json();
        Swal.fire('Error', errorData.Mensaje || 'Hubo un error al actualizar el historial.', 'error');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error.message);
      Swal.fire('Error', error.message || 'Hubo un problema al actualizar el historial.', 'error');
    }
  };
  
  // Resetear el formulario a los valores iniciales
  const resetForm = () => {
    setNuevoHistorial({
      Cod_estado: 1,
      Cod_persona: selectedEstudiante?.Cod_persona || '', // Preseleccionado
      Cod_grado: '',
      Año_Academico: '',
      Promedio_Anual: 70,
      Cod_Instituto: '',
      Observacion: '',
    })
  }

  const handleCancelModal = () => {
    resetForm() // Reiniciar el formulario al cerrar el modal
    setModalVisible(false)
    setModalUpdateVisible(false)
  }

  const handleDeleteHistorial = async () => {
    if (!historialToDelete) return; // Verifica si hay un historial seleccionado
  
    const { Cod_historial_academico } = historialToDelete; // Obtén el código del historial
  
    try {
      // Realizar la solicitud para eliminar el historial
      const response = await fetch(
        'http://localhost:4000/api/historialAcademico/eliminarhistorial',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ Cod_historial_academico }),
        },
      );
  
      if (response.ok) {
        // Registro en la bitácora
        try {
          // Obtener el token de localStorage
          const token = localStorage.getItem('token');
          if (!token) {
            Swal.fire('Error', 'No tienes permiso para realizar esta acción', 'error');
            return;
          }
  
          // Decodificar el token para obtener el código y nombre del usuario
          const decodedToken = jwt_decode.jwtDecode(token);
          if (!decodedToken.cod_usuario || !decodedToken.nombre_usuario) {
            throw new Error('No se pudo obtener el código o el nombre de usuario del token');
          }
  
          // Construir la descripción para la bitácora
          const descripcion = (
            `El usuario: ${decodedToken.nombre_usuario} ha eliminado el historial académico con código ${Cod_historial_academico} ` +
            `para el estudiante: ${selectedEstudiante.PNombre_persona} ${selectedEstudiante.SNombre_persona || ''} ` +
            `${selectedEstudiante.PApellido_persona} ${selectedEstudiante.SApellido_persona || ''}`
          ).trim();
  
          // Registrar la acción en la bitácora
          const bitacoraResponse = await fetch('http://localhost:4000/api/bitacora/registro', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              cod_usuario: decodedToken.cod_usuario,
              cod_objeto: 73, // Código del objeto correspondiente (ajusta según corresponda)
              accion: 'DELETE', // Acción realizada
              descripcion: descripcion,
            }),
          });
  
          if (!bitacoraResponse.ok) {
            throw new Error('No se pudo registrar la acción en la bitácora');
          }
          console.log('Registro en bitácora exitoso');
        } catch (bitacoraError) {
          console.error('Error al registrar en la bitácora:', bitacoraError);
          Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
        }
  
        Swal.fire('Eliminado', 'El historial ha sido eliminado correctamente.', 'success');
        await fetchHistorialAcademicoporPersona(selectedEstudiante.Cod_persona);
        setCurrentView('historiales');
      } else {
        const errorData = await response.json();
        console.error('Error al eliminar el historial:', errorData);
        Swal.fire('Error', errorData.message || 'Hubo un error al eliminar el historial.', 'error');
      }
    } catch (error) {
      console.error('Error al eliminar el historial:', error);
      Swal.fire('Error', 'Hubo un error al eliminar el historial.', 'error');
    }
  
    // Cerrar el modal después de eliminar
    setModalDeleteVisible(false);
  };
  

  const generarAnios = (anioInicio = 1999) => {
    const anios = ['Seleccione Año academico']
    const anioActual = new Date().getFullYear()

    for (let i = anioActual; i >= anioInicio; i--) {
      anios.push(i.toString())
    }
    return anios
  }
  const downloadPDF = () => {
    const doc = new jsPDF()

    // Cambia el color del texto a verde para el título
    doc.setTextColor(0, 128, 0) // Verde (RGB: 0, 128, 0)

    // Añadir título
    doc.text('Historiales Académicos', 14, 16)

    // Obtiene la altura del título
    const titleHeight = 10 // altura aproximada del título

    // Restablece el color de texto a negro para el resto del documento
    doc.setTextColor(0, 0, 0)

    // Dibuja la tabla en una posición más baja para evitar la superposición
    autoTable(doc, {
      startY: 20 + titleHeight, // Esto coloca la tabla justo debajo del título
      head: [
        [
          'Estudiante',
          'Grado',
          'Año Académico',
          'Instituto',
          'Año Académico',
          'Promedio Anual',
          'Estado',
          'Observacion',
        ],
      ],
      body: historiales.map((persona) => [
        persona.Nombre_completo_persona,
        persona.Nombre_grado,
        persona.Año_Academico,
        persona.Nom_Instituto,
        persona.Promedio_Anual,
        persona.Estado_historial,
        persona.Observacion,
      ]),
      headStyles: {
        fillColor: [0, 128, 0], // Color verde en RGB para el fondo del encabezado
        textColor: [255, 255, 255], // Texto en blanco en RGB
        fontStyle: 'bold', // Negrita para el encabezado
      },
    })

    doc.save('historiales.pdf')
  }

  const renderGradosView = () => {
    // Agrupamos los estudiantes por grado
    const estudiantesPorGrado = GradosMatricula.map((gradoM) => {
      const estudiantesEnGrado = Persona.filter((persona) => persona.Cod_grado === gradoM.Cod_grado)
      return { ...gradoM, estudiantes: estudiantesEnGrado }
    })

    
    return (
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
            <CDropdownToggle
              style={{
                backgroundColor: '#6C8E58',
                color: 'white',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5A784C'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6C8E58'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <CIcon icon={cilDescription} /> Reporte
            </CDropdownToggle>
            <CDropdownMenu
              style={{
                position: 'absolute',
                zIndex: 1050,
                /* Asegura que el menú esté por encima de otros elementos*/ backgroundColor: '#fff',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <CDropdownItem
                onClick={generarReporteGradosPDF}
                style={{
                  cursor: 'pointer',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  color: '#333',
                  borderBottom: '1px solid #eaeaea',
                  transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
                onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
              >
                <CIcon icon={cilFile} size="sm" /> Abrir en PDF
              </CDropdownItem>
              <CDropdownItem
                onClick={generarReporteGradosExcel}
                style={{
                  cursor: 'pointer',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  color: '#333',
                  transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
                onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
              >
                <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </div>
        <CRow className="align-items-center mb-5">
          {/* Botón "Volver a Secciones" a la izquierda */}
          <CCol
            xs="12"
            className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
          >
            <div className="flex-grow-1 text-center">
              <h4
                className="text-center fw-semibold pb-2 mb-0"
                style={{ display: 'inline-block', borderBottom: '2px solid #4CAF50' }}
              >
                {' '}
                LISTA DE GRADOS{' '}
              </h4>
            </div>
          </CCol>
        </CRow>

        {/* Contenedor de la barra de búsqueda y el selector dinámico */}
        <CRow className="align-items-center mt-4 mb-2">
          {/* Barra de búsqueda  */}
          <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
            <CInputGroup className="me-3" style={{ width: '350px' }}>
              <CInputGroupText>
                <CIcon icon={cilSearch} />
              </CInputGroupText>
              <CFormInput
                style={{
                  width: '80px',
                  height: '35px',
                  display: 'inline-block',
                  fontSize: '0.8rem',
                }}
                placeholder="Buscar por año..."
                onChange={handleSearch2}
                value={searchTerm2}
              />
              <CButton
                style={{
                  border: '1px solid #ccc',
                  transition: 'all 0.1s ease-in-out', // Duración de la transición
                  backgroundColor: '#F3F4F7', // Color por defecto
                  color: '#343a40', // Color de texto por defecto
                  height: '35px',
                }}
                onClick={() => {
                  setSearchTerm2('')
                  setCurrentPage2(1)
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
            <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
              <div className="d-inline-flex align-items-center">
                <span style={{ fontSize: '0.85rem' }}>Mostrar&nbsp;</span>
                <CFormSelect
                  style={{
                    width: '80px',
                    height: '35px',
                    display: 'inline-block',
                    textAlign: 'center',
                  }}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setRecordsPerPage2(value)
                    setCurrentPage2(1) // Reiniciar a la primera página cuando se cambia el número de registros
                  }}
                  value={recordsPerPage2}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </CFormSelect>
                <span style={{ fontSize: '0.85rem' }}>&nbsp;registros</span>
              </div>
            </CInputGroup>
          </CCol>
        </CRow>
        <div
          className="table-responsive"
          style={{
            maxHeight: '400px',
            margin: '0 auto',
            overflowX: 'auto',
            overflowY: 'auto',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
          }}
        >
          <CTable striped bordered hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>GRADO</CTableHeaderCell>
                <CTableHeaderCell>SECCIÓN</CTableHeaderCell>
                <CTableHeaderCell>PROFESOR</CTableHeaderCell>
                <CTableHeaderCell>AÑO ACADÉMICO</CTableHeaderCell>
                <CTableHeaderCell>ACCIÓN</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {/* Ordenar grados antes de mapear */}
              {currentRecords2.map((gradoM, index) => (
                <CTableRow key={gradoM.Cod_grado}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{gradoM.Nombre_grado}</CTableDataCell>
                  <CTableDataCell>{gradoM.Nombre_seccion}</CTableDataCell>
                  <CTableDataCell>{gradoM.Nombre_Completo}</CTableDataCell>
                  <CTableDataCell>{gradoM.Anio_academico}</CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      color="info"
                      size="sm"
                      style={{
                        backgroundColor: '#F0F4F3',
                        color: '#153E21',
                        border: '1px solid #A2B8A9',
                        borderRadius: '6px',
                        padding: '5px 12px',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = '#dce3dc')}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = '#F0F4F3')}
                      onClick={() => {
                        fetchPersonasPorGrado(gradoM.Cod_grado, gradoM.Anio_academico) // Llama a la función para obtener los estudiantes del grado
                        setGradoSeleccionado(gradoM) // Almacena el grado seleccionado
                        setCurrentView('estudiantes') // Cambia la vista a estudiantes
                      }}
                    >
                      Ver Estudiantes
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>

        {/* Paginación Fija */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '16px',
          }}
        >
          <CPagination aria-label="Page navigation" style={{ display: 'flex', gap: '10px' }}>
            <CButton
              style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
              disabled={currentPage2 === 1} // Deshabilitar si estás en la primera página
              onClick={() => paginate2(currentPage2 - 1)}
            >
              Anterior
            </CButton>
            <CButton
              style={{ marginLeft: '10px', backgroundColor: '#6f8173', color: '#D9EAD3' }}
              disabled={currentPage2 === Math.ceil(filteredGrados.length / recordsPerPage2)} // Deshabilitar si estás en la última página
              onClick={() => paginate2(currentPage2 + 1)}
            >
              Siguiente
            </CButton>
          </CPagination>
          {/* Mostrar total de páginas */}
          <span style={{ marginLeft: '10px' }}>
            Página {currentPage2} de {Math.ceil(filteredGrados.length / recordsPerPage2)}
          </span>
        </div>
      </div>
    )
  }

  const renderEstudiantesView = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
          <CDropdownToggle
            style={{
              backgroundColor: '#6C8E58',
              color: 'white',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5A784C'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6C8E58'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <CIcon icon={cilDescription} /> Reporte
          </CDropdownToggle>
          <CDropdownMenu
            style={{
              position: 'absolute',
              zIndex: 1050,
              /* Asegura que el menú esté por encima de otros elementos*/ backgroundColor: '#fff',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <CDropdownItem
              onClick={generarReportePersonasPDF}
              style={{
                cursor: 'pointer',
                outline: 'none',
                backgroundColor: 'transparent',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                color: '#333',
                borderBottom: '1px solid #eaeaea',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
              onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              <CIcon icon={cilFile} size="sm" /> Abrir en PDF
            </CDropdownItem>
            <CDropdownItem
              onClick={generarReportePersonasExcel}
              style={{
                cursor: 'pointer',
                outline: 'none',
                backgroundColor: 'transparent',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                color: '#333',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
              onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </div>
      <CRow className="align-items-center mb-5">
        {/* Botón "Volver a Secciones" a la izquierda */}
        <CCol
          xs="12"
          className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
        >
          <CButton
            className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4B4B4B')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#656565')}
            style={{
              backgroundColor: '#656565',
              color: '#FFFFFF',
              padding: '6px 12px',
              fontSize: '0.9rem',
              transition: 'background-color 0.2s ease, box-shadow 0.3s ease',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
            onClick={() => setCurrentView('grados')}
          >
            <CIcon icon={cilArrowLeft} />
            Regresar a Grados
          </CButton>
          <div className="flex-grow-1 text-center">
            <h4
              className="text-center fw-semibold pb-2 mb-0"
              style={{ display: 'inline-block', borderBottom: '2px solid #4CAF50' }}
            >
              {' '}
              ESTUDIANTES : / {gradoSeleccionado?.Nombre_grado} / AÑO :{' '}
              {gradoSeleccionado?.Anio_academico}{' '}
            </h4>
          </div>
        </CCol>
      </CRow>

      {/* Filtros y búsqueda */}
      <CRow className="align-items-center mt-4 mb-2">
        {/* Barra de búsqueda */}
        <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
          <CInputGroup className="me-3" style={{ maxWidth: '350px' }}>
            <CInputGroupText>
              <CIcon icon={cilSearch} size="sm" />
            </CInputGroupText>
            <CFormInput
              style={{ width: '80px', height: '35px', display: 'inline-block', fontSize: '0.8rem' }}
              placeholder="Buscar estudiante..."
              value={searchTerm3}
              onChange={handleSearch3}
            />
            <CButton
              style={{
                border: '1px solid #ccc',
                transition: 'all 0.1s ease-in-out', // Duración de la transición
                backgroundColor: '#F3F4F7', // Color por defecto
                color: '#343a40', // Color de texto por defecto
                height: '35px',
              }}
              onClick={() => {
                setSearchTerm3('')
                setCurrentPage3(1)
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

        {/* Selector dinámico */}
        <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
          <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
            <div className="d-inline-flex align-items-center">
              <span style={{ fontSize: '0.85rem' }}>Mostrar&nbsp;</span>
              <CFormSelect
                style={{
                  width: '80px',
                  height: '35px',
                  display: 'inline-block',
                  textAlign: 'center',
                }}
                onChange={(e) => {
                  setRecordsPerPage3(Number(e.target.value)) // Cambiar registros por página
                  setCurrentPage3(1) // Reiniciar a la primera página
                }}
                value={recordsPerPage3}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </CFormSelect>
              <span style={{ fontSize: '0.85rem' }}>&nbsp;registros</span>
            </div>
          </CInputGroup>
        </CCol>
      </CRow>
      <div
        className="table-responsive"
        style={{
          maxHeight: '400px',
          margin: '0 auto',
          overflowX: 'auto',
          overflowY: 'auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        }}
      >
        <CTable striped bordered hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>ESTUDIANTE</CTableHeaderCell>
              <CTableHeaderCell>ACCIÓN</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentRecords3.map((persona, index) => (
              <CTableRow key={index}>
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>
                  {`${persona.PNombre_persona} ${persona.SNombre_persona || ''} ${persona.PApellido_persona} ${persona.SApellido_persona || ''}`.trim()}
                </CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="info"
                    size="sm"
                    style={{
                      backgroundColor: '#F0F4F3',
                      color: '#153E21',
                      border: '1px solid #A2B8A9',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#dce3dc')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#F0F4F3')}
                    onClick={() => handleVerHistoriales(persona)}
                  >
                    Ver Historial
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '16px',
        }}
      >
        <CPagination aria-label="Page navigation" style={{ display: 'flex', gap: '10px' }}>
          <CButton
            style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
            disabled={currentPage3 === 1} // Deshabilitar si estás en la primera página
            onClick={() => paginate3(currentPage3 - 1)}
          >
            Anterior
          </CButton>
          <CButton
            style={{ marginLeft: '10px', backgroundColor: '#6f8173', color: '#D9EAD3' }}
            disabled={currentPage3 === Math.ceil(filteredEstudiantes.length / recordsPerPage3)} // Deshabilitar si estás en la última página
            onClick={() => paginate3(currentPage3 + 1)}
          >
            Siguiente
          </CButton>
        </CPagination>
        {/* Mostrar total de páginas */}
        <span style={{ marginLeft: '10px' }}>
          Página {currentPage3} de {Math.ceil(filteredEstudiantes.length / recordsPerPage3)}
        </span>
      </div>
    </div>
  )

  const renderHistorialesView = () => (
    <div className="table-container" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <CButton
          style={{ backgroundColor: '#4B6251', color: 'white' }}
          className="mb-3 mb-md-0 me-md-3"
          onClick={() => {
            resetForm() // Asegúrate de resetear el formulario aquí
            setModalVisible(true)
            setHasUnsavedChanges(false) // Resetear el estado al abrir el modal
          }}
        >
          <CIcon icon={cilPlus} /> Nuevo
        </CButton>
        <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
          <CDropdownToggle
            style={{
              backgroundColor: '#6C8E58',
              color: 'white',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5A784C'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6C8E58'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <CIcon icon={cilDescription} /> Reporte
          </CDropdownToggle>
          <CDropdownMenu
            style={{
              position: 'absolute',
              zIndex: 1050,
              /* Asegura que el menú esté por encima de otros elementos*/ backgroundColor: '#fff',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <CDropdownItem
              onClick={generarReporteHistorialPDF}
              style={{
                cursor: 'pointer',
                outline: 'none',
                backgroundColor: 'transparent',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                color: '#333',
                borderBottom: '1px solid #eaeaea',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
              onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              <CIcon icon={cilFile} size="sm" /> Abrir en PDF
            </CDropdownItem>
            <CDropdownItem
              onClick={generarReporteHistorialExcel}
              style={{
                cursor: 'pointer',
                outline: 'none',
                backgroundColor: 'transparent',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                color: '#333',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
              onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </div>

      <CRow className="align-items-center mb-5">
        {/* Botón "Volver a Secciones" a la izquierda */}
        <CCol
          xs="12"
          className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
        >
          <CButton
            className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4B4B4B')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#656565')}
            style={{
              backgroundColor: '#656565',
              color: '#FFFFFF',
              padding: '6px 12px',
              fontSize: '0.9rem',
              transition: 'background-color 0.2s ease, box-shadow 0.3s ease',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
            onClick={() => setCurrentView('estudiantes')}
          >
            <CIcon icon={cilArrowLeft} />
            Regresar a Estudiantes
          </CButton>
          <div className="flex-grow-1 text-center">
            <h4
              className="text-center fw-semibold pb-2 mb-0"
              style={{ display: 'inline-block', borderBottom: '2px solid #4CAF50' }}
            >
              {' '}
              HISTORIAL ACADEMICO : {selectedEstudiante.PNombre_persona}{' '}
              {selectedEstudiante.PApellido_persona} {selectedEstudiante.SApellido_persona}{' '}
            </h4>
          </div>
        </CCol>
      </CRow>

      {/* Contenedor de la barra de búsqueda y el selector dinámico */}
      <CRow className="align-items-center mt-4 mb-2">
        {/* Barra de búsqueda  */}
        <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
          <CInputGroup className="me-3" style={{ width: '350px' }}>
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput
              style={{ width: '80px', height: '35px', display: 'inline-block', fontSize: '0.8rem' }}
              placeholder="Buscar por grado..."
              onChange={handleSearch4}
              value={searchTerm4}
            />
            <CButton
              style={{
                border: '1px solid #ccc',
                transition: 'all 0.1s ease-in-out', // Duración de la transición
                backgroundColor: '#F3F4F7', // Color por defecto
                color: '#343a40', // Color de texto por defecto
                height: '35px',
              }}
              onClick={() => {
                setSearchTerm4('')
                setCurrentPage4(1)
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
          <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
            <div className="d-inline-flex align-items-center">
              <span style={{ fontSize: '0.85rem' }}>Mostrar&nbsp;</span>
              <CFormSelect
                style={{
                  width: '80px',
                  height: '35px',
                  display: 'inline-block',
                  textAlign: 'center',
                }}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setRecordsPerPage4(value)
                  setCurrentPage4(1) // Reiniciar a la primera página cuando se cambia el número de registros
                }}
                value={recordsPerPage4}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </CFormSelect>
              <span style={{ fontSize: '0.85rem' }}>&nbsp;registros</span>
            </div>
          </CInputGroup>
        </CCol>
      </CRow>

      <div
        className="table-responsive"
        style={{
          maxHeight: '400px',
          margin: '0 auto',
          overflowX: 'auto',
          overflowY: 'auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        }}
      >
        <CTable striped bordered hover responsive style={{ minWidth: '700px', fontSize: '15px' }}>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>ESTUDIANTE</CTableHeaderCell>
              <CTableHeaderCell>GRADO</CTableHeaderCell>
              <CTableHeaderCell>AÑO ACADÉMICO</CTableHeaderCell>
              <CTableHeaderCell>INSTITUTO</CTableHeaderCell>
              <CTableHeaderCell>PROMEDIO ANUAL</CTableHeaderCell>
              <CTableHeaderCell>ESTADO</CTableHeaderCell>
              <CTableHeaderCell>OBSERVACION</CTableHeaderCell>
              <CTableHeaderCell>ACCION</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {historiales.length === 0 ? (
              <CTableRow>
                <CTableDataCell
                  colSpan="9"
                  style={{ textAlign: 'center', color: 'gray', fontSize: '16px' }}
                >
                  El estudiante no tiene historiales academicos.
                </CTableDataCell>
              </CTableRow>
            ) : (
              currentRecords4.map((persona, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell style={{ whiteSpace: 'nowrap' }}>
                    {persona.Nombre_completo_persona}
                  </CTableDataCell>
                  <CTableDataCell style={{ whiteSpace: 'nowrap' }}>
                    {persona.Nombre_grado}
                  </CTableDataCell>
                  <CTableDataCell>{persona.Año_Academico}</CTableDataCell>
                  <CTableDataCell style={{ whiteSpace: 'nowrap' }}>
                    {persona.Nom_Instituto}
                  </CTableDataCell>
                  <CTableDataCell>{persona.Promedio_Anual}</CTableDataCell>

                  <CTableDataCell>{persona.Estado_historial}</CTableDataCell>
                  <CTableDataCell>{persona.Observacion || 'N/A'}</CTableDataCell>
                  <CTableDataCell style={{ whiteSpace: 'nowrap' }}>
                    <CButton color="warning" onClick={() => openUpdateModal(persona)}>
                      <CIcon icon={cilPen} />
                    </CButton>
                    <CButton
                      color="danger"
                      style={{ backgroundColor: '#E57368', marginLeft: '10px' }}
                      onClick={() => openDeleteModal(persona)}
                    >
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </div>

      {/* Paginación Fija */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '16px',
        }}
      >
        <CPagination aria-label="Page navigation" style={{ display: 'flex', gap: '10px' }}>
          <CButton
            style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
            disabled={currentPage4 === 1} // Deshabilitar si estás en la primera página
            onClick={() => paginate4(currentPage4 - 1)}
          >
            Anterior
          </CButton>
          <CButton
            style={{ marginLeft: '10px', backgroundColor: '#6f8173', color: '#D9EAD3' }}
            disabled={currentPage4 === Math.ceil(filteredhistoriales.length / recordsPerPage4)} // Deshabilitar si estás en la última página
            onClick={() => paginate4(currentPage4 + 1)}
          >
            Siguiente
          </CButton>
        </CPagination>
        {/* Mostrar total de páginas */}
        <span style={{ marginLeft: '10px' }}>
          Página {currentPage4} de {Math.ceil(filteredhistoriales.length / recordsPerPage4)}
        </span>
      </div>
    </div>
  )

  return (
    <CContainer>
      <CContainer>
        {currentView === 'historiales' && renderHistorialesView(Persona)}
        {currentView === 'grados' && renderGradosView()}
        {currentView === 'estudiantes' && renderEstudiantesView()}
      </CContainer>

      <CModal visible={modalVisible} onClose={handleCancelModal} backdrop="static" keyboard={false}>
        <CModalHeader closeButton={false}>
          <CModalTitle>
            AGREGAR HISTORIAL : {selectedEstudiante?.PNombre_persona || ''}{' '}
            {selectedEstudiante?.PApellido_persona || ''}
          </CModalTitle>
          <CButton
            className="btn-close"
            aria-label="Close"
            onClick={() => handleCloseModal(setModalVisible, resetNuevoHistorial)}
          />
        </CModalHeader>

        <CForm className="p-3">
          {/* Campo de Estado */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Estado</CInputGroupText>
            <CFormInput
              type="text"
              value={
                estadonota.find((estado) => estado.Cod_estado === 1)?.Descripcion ||
                'Estado no disponible'
              }
              disabled // Hace el campo no editable
            />
          </CInputGroup>

          {/* Nombre del Estudiante */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Estudiante</CInputGroupText>
            <CFormInput
              type="text"
              value={
                selectedEstudiante
                  ? `${selectedEstudiante.PNombre_persona || ''} ${selectedEstudiante.SNombre_persona || ''} ${selectedEstudiante.PApellido_persona || ''} ${selectedEstudiante.SApellido_persona || ''}`.trim()
                  : 'Nombre no disponible'
              }
              disabled
            />
          </CInputGroup>

          {/* Campo de Grado */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Grado</CInputGroupText>
            <CFormSelect
              ref={inputRef}
              value={nuevoHistorial.Cod_grado || ''}
              onChange={(e) => handleInputChange(e, 'Cod_grado')}
            >
              <option value="">Seleccione grado</option>
              {Grados.map((grado) => (
                <option key={grado.Cod_grado} value={grado.Cod_grado}>
                  {grado.Nombre_grado}
                </option>
              ))}
            </CFormSelect>
          </CInputGroup>

          {/* Campo de Año Académico */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Año Académico</CInputGroupText>
            <CFormSelect
              ref={inputRef}
              value={nuevoHistorial.Año_Academico || ''}
              onChange={(e) => handleInputChange(e, 'Año_Academico')}
            >
              {generarAnios().map((anio) => (
                <option key={anio} value={anio}>
                  {anio}
                </option>
              ))}
            </CFormSelect>
          </CInputGroup>

          {/* Campo de Promedio Anual */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Promedio Anual</CInputGroupText>
            <CFormInput
              ref={inputRef}
              type="number"
              value={nuevoHistorial.Promedio_Anual || ''}
              onChange={(e) => handleInputChange(e, 'Promedio_Anual')}
              placeholder="Ingrese el promedio anual"
            />
          </CInputGroup>

          {/* Campo de Instituto */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Instituto</CInputGroupText>
            <CFormSelect
              ref={inputRef}
              value={nuevoHistorial.Cod_Instituto || ''}
              onChange={(e) => handleInputChange(e, 'Cod_Instituto')}
            >
              <option value="">Seleccione un instituto</option>
              {Instituto.length > 0 ? (
                Instituto.map((instituto) => (
                  <option key={instituto.Cod_Instituto} value={instituto.Cod_Instituto}>
                    {instituto.Nom_Instituto}
                  </option>
                ))
              ) : (
                <option>Cargando institutos...</option>
              )}
            </CFormSelect>
          </CInputGroup>

          {/* Campo de Observaciones */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Observaciones</CInputGroupText>
            <CFormInput
              ref={inputRef}
              type="text"
              value={nuevoHistorial.Observacion || ''}
              onChange={(e) => handleInputChange(e, 'Observacion')}
              placeholder="Ingrese una observación"
            />
          </CInputGroup>
        </CForm>

        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => handleCloseModal(setModalVisible, resetNuevoHistorial)}
          >
            Cancelar
          </CButton>
          <CButton
            style={{
              backgroundColor: '#4B6251',
              color: 'white',
            }}
            onClick={handleCreateHistorial} // Solo llama a la función de creación
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3C4B43')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4B6251')}
          >
            <CIcon icon={cilSave} style={{ marginRight: '5px' }} />
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        visible={modalUpdateVisible}
        onClose={() => handleCloseModal(setModalUpdateVisible, resetNuevoHistorial)}
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader closeButton={false}>
          <CModalTitle>
            ACTUALIZAR HISTORIAL : {selectedEstudiante?.PNombre_persona || ''}{' '}
            {selectedEstudiante?.PApellido_persona || ''}
          </CModalTitle>
          <CButton
            className="btn-close"
            aria-label="Close"
            onClick={() => handleCloseModal(setModalUpdateVisible, resetNuevoHistorial)}
          />
        </CModalHeader>

        <CForm className="p-3">
          {/* Campo de Estado */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Estado</CInputGroupText>
            <CFormInput
              type="text"
              value={
                estadonota.find((estado) => estado.Cod_estado === 1)?.Descripcion ||
                'Estado no disponible'
              }
              disabled // Hace el campo no editable
            />
          </CInputGroup>

          {/* Nombre del Estudiante */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Estudiante</CInputGroupText>
            <CFormInput
              type="text"
              value={
                selectedEstudiante
                  ? `${selectedEstudiante.PNombre_persona || ''} ${selectedEstudiante.SNombre_persona || ''} ${selectedEstudiante.PApellido_persona || ''} ${selectedEstudiante.SApellido_persona || ''}`.trim()
                  : 'Nombre no disponible'
              }
              disabled
            />
          </CInputGroup>

          {/* Campo de Grado */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Grado</CInputGroupText>
            <CFormSelect
              ref={inputRef}
              value={historialAEditar?.Cod_grado || ''}
              onChange={(e) => handleInputChange(e, 'Cod_grado')}
            >
              <option value="">Seleccione grado</option>
              {Grados.map((grado) => (
                <option key={grado.Cod_grado} value={grado.Cod_grado}>
                  {grado.Nombre_grado}
                </option>
              ))}
            </CFormSelect>
          </CInputGroup>

          {/* Campo de Año Académico */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Año Académico</CInputGroupText>
            <CFormSelect
              ref={inputRef}
              value={historialAEditar?.Año_Academico || ''}
              onChange={(e) => handleInputChange(e, 'Año_Academico')}
            >
              {generarAnios().map((anio) => (
                <option key={anio} value={anio}>
                  {anio}
                </option>
              ))}
            </CFormSelect>
          </CInputGroup>

          {/* Campo de Promedio Anual */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Promedio Anual</CInputGroupText>
            <CFormInput
              ref={inputRef}
              type="number"
              value={historialAEditar?.Promedio_Anual || ''}
              onChange={(e) => handleInputChange(e, 'Promedio_Anual')}
              placeholder="Ingrese el promedio anual"
            />
          </CInputGroup>

          {/* Campo de Instituto */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Instituto</CInputGroupText>
            <CFormSelect
              ref={inputRef}
              value={historialAEditar?.Cod_Instituto || ''}
              onChange={(e) => handleInputChange(e, 'Cod_Instituto')}
            >
              <option value="">Seleccione un instituto</option>
              {Instituto.length > 0 ? (
                Instituto.map((instituto) => (
                  <option key={instituto.Cod_Instituto} value={instituto.Cod_Instituto}>
                    {instituto.Nom_Instituto}
                  </option>
                ))
              ) : (
                <option>Cargando institutos...</option>
              )}
            </CFormSelect>
          </CInputGroup>

          {/* Campo de Observaciones */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Observaciones</CInputGroupText>
            <CFormInput
              ref={inputRef}
              type="text"
              value={historialAEditar?.Observacion || ''}
              onChange={(e) => handleInputChange(e, 'Observacion')}
              placeholder="Ingrese una observación"
            />
          </CInputGroup>
        </CForm>

        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => handleCloseModal(setModalUpdateVisible, resetNuevoHistorial)}
          >
            Cancelar
          </CButton>
          <CButton
            style={{
              backgroundColor: '#4B6251',
              color: 'white',
            }}
            onClick={handleUpdateHistorial} // Llamada a la función de actualización
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3C4B43')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4B6251')}
          >
            <CIcon icon={cilSave} style={{ marginRight: '5px' }} />
            Actualizar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar Historial */}
      <CModal
        visible={modalDeleteVisible}
        onClose={() => setModalDeleteVisible(false)}
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            ¿Estás seguro de que deseas eliminar el historial académico del :{' '}
            <strong>{historialToDelete ? historialToDelete.Nombre_grado : ''}</strong>?
          </p>{' '}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton
            style={{ backgroundColor: '#E57368', color: 'white' }}
            onClick={handleDeleteHistorial} // Ejecuta la función de eliminación
          >
            <CIcon icon={cilTrash} style={{ marginRight: '5px' }} /> Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default ListaHistoriales
