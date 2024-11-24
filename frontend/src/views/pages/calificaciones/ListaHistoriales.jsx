import React, { useEffect, useState, useRef } from 'react';
import { CSidebarNav } from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilDescription } from '@coreui/icons';
import Swal from 'sweetalert2'; // Importa SweetAlert2
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
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect
} from '@coreui/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ListaHistoriales = () => {
  const [historiales, setHistoriales] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalReportVisible, setModalReportVisible] = useState(false); // Modal de Reporte
  const [error, setError] = useState('');
  const [historialAEditar, setHistorialAEditar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [itemsPerPage, setItemsPerPage] = useState(5); // Estado para los elementos por página
  const [Grados, setGrados] = useState([]);
  const [Instituto, setInstituto] = useState([]);
  const [Persona, setPersona] = useState([]);
  const [nuevoHistorial, setNuevoHistorial] = useState({
    Estudiante: 'Seleccione una opción',
    Grado: 'Seleccione una opción',
    Año_Academico: 'Seleccione una opción',
    Promedio_Anual: 0,
    Instituto: ''
  });
  
  useEffect(() => {
    fetchHistorial();
    fetchGrados();
    fetchInstituto();
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/persona/verPersonas');
      const data = await response.json();
      console.log(data);
      setPersona(data);
    } catch (error) {
      console.error('Error al obtener los estudiantes: ', error);
    }
  };

  const fetchGrados = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/grados/vergrados');
      const data = await response.json();
      console.log(data); // Verifica la respuesta en la consola
      setGrados(data); 
    } catch (error) {
      console.error('Error al obtener los grados:', error);
    }
  };

const fetchInstituto = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/instituto/instituto');
    const data = await response.json();
    console.log(data); //verifica las respuestas en la consola
    setInstituto(data);
  } catch (error) {
    console.error('Error al obtener los institutos: ', error);
  }
};

  const fetchHistorial = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/historialAcademico/historiales');
      const data = await response.json();
  
      // Renumera los historiales secuencialmente
      const historialesNumerados = data.map((historial, index) => ({
        ...historial,
      }));
  
      setHistoriales(historialesNumerados);
    } catch (error) {
      console.error('Error al obtener los historiales:', error);
    }
  };

  const filteredHistoriales = historiales.filter(historial => {
    // Convertir Cod_estado a texto
    const estadoTexto = 
      historial.Cod_estado === 1 ? "APROBADO" :
      historial.Cod_estado === 2 ? "REPROBADO" : "otro estado";
  
    return (
      historial.Cod_historial_academico.toString().includes(searchTerm) ||
      historial.Estudiante.toLowerCase().trim().includes(searchTerm.toLowerCase().trim()) ||
      historial.Grado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      historial.Año_Academico.toString().includes(searchTerm) ||
      historial.Promedio_Anual.toString().includes(searchTerm) ||
      historial.Instituto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estadoTexto.includes(searchTerm.toLowerCase())
    );
  });
  

// Paginación: calcular los índices de los elementos que se van a mostrar
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentHistoriales = filteredHistoriales.slice(indexOfFirstItem, indexOfLastItem);

const totalPages = Math.ceil(filteredHistoriales.length / itemsPerPage);

const handleInputChange = (e, field) => {
  let value = e.target.value;

  // Validación para el campo Promedio_Anual
  if (field === 'Promedio_Anual') {
      const validNumber = /^\d*\.?\d*$/; // Solo permite números y un punto decimal
      if (value && !validNumber.test(value)) {
          Swal.fire({
            icon: 'error',
            title: 'Formato inválido',
            text: 'Por favor ingrese un valor numérico válido, incluyendo un punto decimal.',
            confirmButtonColor: '#6f8173', // Color del botón
          });
          return;
      }

    // Validar que el valor esté entre 0 y 100
    if (value !== '' && (parseFloat(value) < 0 || parseFloat(value) > 100)) {
      Swal.fire({
        icon: 'error',
        title: 'Rango inválido',
        text: 'El Promedio Anual debe estar entre 0 y 100.',
        confirmButtonColor: '#6f8173',
      });
      return;
    }
  }
  setError('');
  setNuevoHistorial({ ...nuevoHistorial, [field]: value });
};

const HistorialesSearch = () => {
const [searchTerm, setSearchTerm] = useState(''); // Definimos el estado para el término de búsqueda
};

const handleClearSearch = () => {
  setSearchTerm(''); // Limpiar el término de búsqueda
};

const validateFields = () => {
  const { Estudiante, Grado, Año_Academico, Promedio_Anual, Instituto } = nuevoHistorial;
  if (!Estudiante ||!Grado || !Año_Academico || !Promedio_Anual || !Instituto) {
    setError('Por favor, complete todos los campos.');
    return false;
  }
  setError('');
  return true;
};  

const handleCreateHistorial = async () => {
  if (!validateFields()) return;

  const promedio = parseFloat(nuevoHistorial.Promedio_Anual);
  const codEstado = promedio > 69.99 ? 1 : 2;

  const historialConEstado = { ...nuevoHistorial, Cod_estado: codEstado };

  try {
    const response = await fetch('http://localhost:4000/api/historialAcademico/crearhistorial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(historialConEstado),
    });

    if (response.ok) {
      await fetchHistorial(); // Recarga los historiales
      setCurrentPage(1); // Restablece la página actual a la primera
      resetForm();
      setModalVisible(false);
    } else {
      const errorData = await response.json();
      setError('Error al crear el historial: ' + errorData.message);
    }
  } catch (error) {
    setError('Error al crear el historial: ' + error.message);
  }
};

const getEstadoTexto = (cod_estado) => {
  switch (cod_estado) {
    case 1:
      return 'APROBADO';
    case 2:
      return 'REPROBADO';
  }
};

const handleEditHistorial = (historial) => {
  setHistorialAEditar(historial);
  setNuevoHistorial({ ...historial }); // Copia el historial a nuevoHistorial
  setModalVisible(true);
};

const handleUpdateHistorial = async () => {
  if (error || !validateFields()) return;

  // Lógica para determinar el Cod_estado basado en el Promedio_Anual
  const promedio = parseFloat(nuevoHistorial.Promedio_Anual);
  const codEstado = promedio >= 70.00 ? 1 : 2; // O el valor que corresponda

  // Actualiza el Cod_estado en nuevoHistorial
  const historialActualizado = { ...nuevoHistorial, Cod_estado: codEstado };

  try {
    const response = await fetch('http://localhost:4000/api/historialAcademico/actualizarhistorial', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(historialActualizado),
    });

    if (response.ok) {
      fetchHistorial();
      setModalVisible(false);
      setHistorialAEditar(null);
      resetForm(); // Llamar a la función para reiniciar el formulario
    } else {
      const errorData = await response.json();
      console.error('Error al actualizar el historial:', errorData);
    }
  } catch (error) {
    console.error('Error al actualizar el historial:', error);
  }
};

const resetForm = () => {
  setNuevoHistorial({ 
      Estudiante: 'Seleccione una opción',
      Grado: 'Seleccione una opción', // Asigna un valor predeterminado si aplica
      Año_Academico: 'Seleccione una opción',
      Promedio_Anual: 0,
      Instituto: ''
  }); 
  setError('');
  setHistorialAEditar(null);
};

const handleCancelModal = () => {
  resetForm(); // Reiniciar el formulario al cerrar el modal
  setModalVisible(false);
};

  const handleDeleteHistorial = async (id) => {
    // Mostrar el aviso de confirmación con SweetAlert
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Este historial se eliminará permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      allowOutsideClick: false, // Evita que el modal se cierre al hacer clic fuera
    });

    // Si el usuario confirma, proceder con la eliminación
    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:4000/api/historialAcademico/eliminarhistorial`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ Cod_historial_academico: id }),
        });

        if (response.ok) {
          Swal.fire('Eliminado', 'El historial ha sido eliminado correctamente.', 'success');
          fetchHistorial(); // Llamar a la función para actualizar los datos
        } else {
          const errorData = await response.json();
          console.error('Error al eliminar el historial:', errorData);
          Swal.fire('Error', 'Hubo un error al eliminar el historial.', 'error');
        }
      } catch (error) {
        console.error('Error al eliminar el historial:', error);
        Swal.fire('Error', 'Hubo un error al eliminar el historial.', 'error');
      }
    }
  };

  const generarAnios = (anioInicio = 1901) => {
    const anios = ['Seleccione una opción'];
    const anioActual = new Date().getFullYear();
    
    for (let i = anioActual; i >= anioInicio; i--) {
      anios.push(i.toString());
    }
    return anios;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Cambia el color del texto a verde para el título
    doc.setTextColor(0, 128, 0); // Verde (RGB: 0, 128, 0)
    
    // Añadir título
    doc.text('Historiales Académicos', 14, 16);
    
    // Obtiene la altura del título
    const titleHeight = 10; // altura aproximada del título
    
    // Restablece el color de texto a negro para el resto del documento, si es necesario
    doc.setTextColor(0, 0, 0);
    
    // Dibuja la tabla en una posición más baja para evitar la superposición
    autoTable(doc, {
      startY: 20 + titleHeight, // Esto coloca la tabla justo debajo del título
      head: [['Código de Historial', 'Código de Estado', 'Estudiante' , 'Grado', 'Año Académico', 'Promedio Anual', 'Fecha Registro', 'Instituto']],
      body: filteredHistoriales.map(historial => [
        historial.Cod_historial_academico,
        historial.Cod_estado,
        historial.Estudiante,
        historial.Grado,
        historial.Año_Academico,
        historial.Promedio_Anual,
        new Date(historial.Fecha_Registro).toLocaleDateString('es-ES'),
        historial.Instituto
      ]),
      headStyles: {
        fillColor: [0, 128, 0], // Color verde en RGB para el fondo del encabezado
        textColor: [255, 255, 255], // Texto en blanco en RGB
        fontStyle: 'bold' // Negrita para el encabezado
      }
    });
    
    doc.save('historiales.pdf');
  };  

  const downloadExcel = () => {
    if (filteredHistoriales.length === 0) {
      alert('No hay datos para descargar');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(filteredHistoriales.map(historial => ({
      'Código de Historial': historial.Cod_historial_academico,
      'Código de Estado': historial.Cod_estado,
      'Estudiante': historial.Estudiante,
      'Grado': historial.Grado,
      'Año Académico': historial.Año_Academico,
      'Promedio Anual': historial.Promedio_Anual,
      'Fecha Registro': new Date(historial.Fecha_Registro).toLocaleDateString('es-ES'),
      'Instituto': historial.Instituto
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historiales');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'historiales.xlsx');
  };


  return (
    <CContainer>
            <h1>Mantenimiento Historiales</h1>
      {/* Botón de Agregar Historial arriba de la barra de búsqueda */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <CButton 
          style={{ backgroundColor: '#4B6251', color: 'white' }} 
          className="mb-3 mb-md-0 me-md-3"
          onClick={() => {
              resetForm(); // Asegúrate de resetear el formulario aquí
              setModalVisible(true);
          }}
          >
          <CIcon icon={cilPlus} /> Nuevo
        </CButton>
        <CButton
        style={{ backgroundColor: '#6C8E58', color: 'white' }}
        onClick={() => setModalReportVisible(true)} // Abre modal de reporte
      >
        <CIcon icon={cilDescription} /> Reporte
      </CButton>
      </div>

      <div className="d-flex mb-3">
        <CInputGroupText>
          <CIcon icon={cilSearch} /> {/* Icono de lupa */}
        </CInputGroupText>
        <CFormInput
          placeholder="Buscar Historiales..."
          value={searchTerm}
          onChange={(e) => {
            const inputValue = e.target.value.toUpperCase(); // Convertir a mayúsculas

            // Verificar que solo se ingresen letras (A-Z), números, tildes y espacios
            if (/[^A-ZÁÉÍÓÚ´Ñ0-9\s]/g.test(inputValue)) {
              Swal.fire({
                icon: "error",
                title: "Carácter no permitido",
                text: "Solo se permiten letras, tildes, números y espacios.",
              });
              return; // Evitar actualización del estado
            }

            // Verificar más de tres repeticiones consecutivas
            if (/(.)\1{3,}/g.test(inputValue)) {
              Swal.fire({
                icon: "error",
                title: "Demasiadas repeticiones",
                text: "No puedes ingresar más de tres veces la misma letra consecutiva.",
              });
              return; // Evitar actualización del estado
            }

            setSearchTerm(inputValue); // Actualizar el estado con el valor validado
          }}
          style={{ width: "200px" }} // Ajusta el ancho aquí
        />
        <CButton
          onClick={handleClearSearch} // Función para limpiar el término de búsqueda
          style={{
            border: "1px solid #ccc",
            transition: "all 0.1s ease-in-out", // Duración de la transición
            backgroundColor: "#F3F4F7", // Color por defecto
            color: "#343a40", // Color de texto por defecto
          }}
        >
          <CIcon icon={cilBrushAlt} /> Limpiar{/* Icono de escoba */}
        </CButton>{" "}
        {/* Botón para limpiar la búsqueda */}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: 'small', marginBottom: '10px' }}>
        <span>Mostrar</span>
        <CFormSelect
          aria-label="Items por página"
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1); 
          }}
          style={{ width: 'auto', margin: '0 8px' }}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </CFormSelect>
        <span>historiales</span>
      </div>

      <div className="table-container" style={{ overflowY: 'auto', marginBottom: '20px' }}>
        <CTable striped bordered hover responsive style={{ minWidth: '700px', fontSize: '16px' }}>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Código de Historial</CTableHeaderCell>
              <CTableHeaderCell>Estado</CTableHeaderCell>
              <CTableHeaderCell>Estudiante</CTableHeaderCell>
              <CTableHeaderCell>Grado</CTableHeaderCell>
              <CTableHeaderCell>Año Académico</CTableHeaderCell>
              <CTableHeaderCell>Promedio Anual</CTableHeaderCell>
              <CTableHeaderCell>Fecha Registro</CTableHeaderCell>
              <CTableHeaderCell>Instituto</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentHistoriales.map((historial, index) => (
              <CTableRow key={index}>
                <CTableDataCell>{indexOfFirstItem + index + 1}</CTableDataCell>
                <CTableDataCell>{historial.Cod_historial_academico}</CTableDataCell>
                <CTableDataCell>{getEstadoTexto(historial.Cod_estado)}</CTableDataCell>
                <CTableDataCell>{historial.Estudiante}</CTableDataCell>
                <CTableDataCell>{historial.Grado}</CTableDataCell>
                <CTableDataCell>{historial.Año_Academico}</CTableDataCell>
                <CTableDataCell>{historial.Promedio_Anual}</CTableDataCell>
                <CTableDataCell>{new Date(historial.Fecha_Registro).toLocaleDateString('es-ES')}</CTableDataCell>
                <CTableDataCell>{historial.Instituto}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="info" onClick={() => handleEditHistorial(historial)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton color="danger" onClick={() => handleDeleteHistorial(historial.Cod_historial_academico)}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      {/* Paginación debajo de la tabla */}
      <nav>
        <ul className="pagination justify-content-center align-items-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              style={{ 
                backgroundColor: currentPage === 1 ? 'rgba(111, 129, 115, 0.5)' : '#6f8173', // Opaco si está deshabilitado
                color: '#D9EAD3', 
                borderRadius: '5px', // Esquinas redondeadas
                transition: 'background-color 0.3s ease', // Transición suave para el cambio de color
              }} 
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5b52'} // Color al pasar el mouse
              onMouseLeave={(e) => e.target.style.backgroundColor = currentPage === 1 ? 'rgba(111, 129, 115, 0.5)' : '#6f8173'} // Color original al salir
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
          </li>
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              style={{ 
                backgroundColor: '#6f8173', 
                color: '#D9EAD3', 
                borderRadius: '5px', // Esquinas redondeadas
                transition: 'background-color 0.3s ease', // Transición suave para el cambio de color
              }} 
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5b52'} // Color al pasar el mouse
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6f8173'} // Color original al salir
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </li>
          <li className="page-item">
            <span style={{ margin: '0 10px', color: '#6f8173' }}>Página {currentPage} de {totalPages}</span>
          </li>
        </ul>
      </nav>

      <CModal visible={modalVisible} onClose={handleCancelModal} backdrop="static" keyboard={false}>
        <CModalHeader>
          <CModalTitle>{historialAEditar ? 'Editar Historial' : 'Agregar Historial'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
          {/*Campo para seleccionar el estudiante*/}
          <CFormSelect
          label="Estudiante"
            value={nuevoHistorial.Estudiante}
            onChange={(e) => setNuevoHistorial({ ...nuevoHistorial, Estudiante: e.target.value })}
          >
            <option>Seleccione un estudiante</option>
            {Persona.map((persona) => (
              <option key={persona.cod_persona} value={`${persona.Primer_nombre} ${persona.Segundo_nombre || ''} ${persona.Primer_apellido} ${persona.Segundo_Apellido || ''}`.trim()}>
                {`${persona.Primer_nombre} ${persona.Segundo_nombre || ''} ${persona.Primer_apellido} ${persona.Segundo_Apellido || ''}`.trim()}
              </option>
            ))}
          </CFormSelect>
            {/* Campo para seleccionar el Grado */}
            <CFormSelect
            label="Grado"
              value={nuevoHistorial.Grados}
              onChange={(e) => handleInputChange(e, 'Grado')}
            >
              <option value="">Seleccione una opción</option>
              {Grados.length > 0 ? (
                Grados.map((grado, index) => (
                  <option key={index} value={grado.Nombre_grado}>
                    {grado.Nombre_grado}
                  </option>
                ))
              ) : (
                <option>Cargando grados...</option>
              )}
            </CFormSelect>
            <CFormSelect
              label="Año Académico"
              value={nuevoHistorial.Año_Academico}
              onChange={(e) => handleInputChange(e, 'Año_Academico')}
              options={generarAnios().map(anio => ({ label: anio, value: anio }))}
            />
            <CFormInput
              label="Promedio Anual"
              type="number"
              value={nuevoHistorial.Promedio_Anual}
              onChange={(e) => handleInputChange(e, 'Promedio_Anual')}
            />
            {/*Campo para seleccioanr los institutos*/}
            <CFormSelect
            label="Instituto"
            value={nuevoHistorial.Instituto}
            onChange={(e) => handleInputChange(e, 'Instituto')}
            >
              <option value="">Seleccione una opción</option>
              {Instituto.length > 0 ? (
                Instituto.map((instituto, index) => (
                  <option key={index} value={instituto.Nom_Instituto}>
                    {instituto.Nom_Instituto}
                  </option>
                ))
              ) : (
                <option>Cargando institutos...</option>
              )}
            </CFormSelect>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCancelModal}>Cancelar</CButton>
          <CButton color="primary" onClick={historialAEditar ? handleUpdateHistorial : handleCreateHistorial}>
            {historialAEditar ? 'Actualizar' : 'Crear'}
          </CButton>
        </CModalFooter>
      </CModal>

             {/* Modal para Reporte */}
             <CModal visible={modalReportVisible} onClose={() => setModalReportVisible(false)} backdrop="static" keyboard={false}>
        <CModalHeader>
          <CModalTitle>Generar Reporte</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Seleccione el formato para descargar el reporte:</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={downloadPDF}>PDF</CButton>
          <CButton color="primary" onClick={downloadExcel}>Excel</CButton>
          <CButton color="secondary" onClick={() => setModalReportVisible(false)}>Cerrar</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaHistoriales;
