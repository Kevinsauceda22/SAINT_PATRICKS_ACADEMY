import React, { useEffect, useState } from 'react';
import { cilArrowLeft,cilPen,cilSearch,cilPlus, cilSpreadsheet,cilInfo,cilDescription,  cilFile,cilSave, cilBrushAlt } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import Swal from 'sweetalert2';
import {
  CContainer, CRow, CCol, CCard, CTable, CTableHeaderCell, CTableBody, CTableRow, CTableDataCell, CButton, CSpinner, CCardBody, CDropdown,CDropdownToggle,
  CDropdownMenu, CDropdownItem,CTableHead,CModal,CModalHeader,CModalTitle,CModalBody,CModalFooter,CInputGroup,CInputGroupText,CFormInput,CFormSelect,CPagination
} from '@coreui/react';
import logo from 'src/assets/brand/logo_saint_patrick.png'

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import 'jspdf-autotable';
import * as XLSX from "xlsx";
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

const ListaCuadroPadre = () => {
  const { canSelect, canInsert, canUpdate } = usePermission('ListaCuadroPadre');
  const [hijos, setHijos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [currentView, setCurrentView] = useState('hijos');
  const [estudiantes, setEstudiantes] = useState([]);
  const [nombreSeccionSeleccionada, setNombreSeccionSeleccionada] = useState('');
  const [nombreasignaturaSeleccionada, setNombreAsignaturaSeleccionada] = useState('');
  const [anioSeccionSeleccionada, setAnioSeccionSeleccionada] = useState('');
  const [selectedCodSeccion, setSelectedCodSeccion] = useState(null);
  const [gradoSeleccionado, setGradoSeleccionado] = useState('');
  const [nombreEstudiante, setNombreEstudiante] = useState("");  // Estado para almacenar el nombre del estudiante
  const [identidadEstudiante, setIdentidadEstudiante] = useState("");
  //para paginacion y busqueda de la vista hijos
const [recordsPerPage2, setRecordsPerPage2] = useState(5);
const [searchTerm2, setSearchTerm2] = useState('');
const [currentPage2, setCurrentPage2] = useState(1);

const [cuadroNotas, setCuadroNotas] = useState([]);

  useEffect(() => {
    fetchHijosMatriculados();
  }, []);

  const fetchHijosMatriculados = async () => {
    try {
      // Obtener el token del almacenamiento local o donde lo guardes
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado');
  
      // Llamada a la nueva API que devuelve los hijos matriculados
      const response = await fetch('http://74.50.68.87/api/notas/hijos', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al obtener los hijos matriculados');
      
      const data = await response.json();
      setHijos(data.hijos); // Asignar los hijos al estado
    } catch (error) {
      console.error('Error al obtener los hijos matriculados:', error);
    } finally {
      setCargando(false);
    }
  };


  const fetchCuadroNotas = async (Cod_seccion_matricula, nombreEstudiante, identidad,grado,seccion) => {
    try {
      setNombreEstudiante(nombreEstudiante);
      setIdentidadEstudiante(identidad);
      setGradoSeleccionado(grado);
      setNombreSeccionSeleccionada(seccion);
      const response = await fetch(`http://74.50.68.87/api/notas/notasypromedio/${Cod_seccion_matricula}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Incluye el token si es necesario
        },
      });
  
      if (!response.ok) throw new Error('Error al obtener el cuadro de notas.');
  
      const data = await response.json();
      setCuadroNotas(data);
      setCurrentView('cuadroNotas'); // Cambiar la vista actual al cuadro de notas
    } catch (error) {
      console.error('Error al obtener el cuadro de notas:', error);
      Swal.fire('Error', 'No se pudieron cargar los datos del cuadro de notas', 'error');
    }
  };
  

const disableCopyPaste = (e) => {
  e.preventDefault();
  Swal.fire({
    icon: 'warning',
    title: 'Acción bloqueada',
    text: 'Copiar y pegar no está permitido.',
    confirmButtonText: 'Aceptar',
  });
};
//-------------------paginacion, buscador vista actual : secciones-----------------------------
const handleSearch2 = (event) => {
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
      confirmButtonText: 'Aceptar',
    });
    value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
  }

  // Validar caracteres permitidos
  if (!regex.test(value)) {
    Swal.fire({
      icon: 'warning',
      title: 'Caracteres no permitidos',
      text: 'Solo se permiten letras, números y espacios.',
      confirmButtonText: 'Aceptar',
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
          confirmButtonText: 'Aceptar',
        });
        return;
      }
    }
  }

  // Establecer el valor del input y resetear la página
  setSearchTerm2(value);
  setCurrentPage2(1); // Resetear a la primera página al buscar
};


// Filtro de búsqueda
const filteredHijos= hijos.filter((hijo) =>
  hijo.Nombre_Completo.toLowerCase().includes(searchTerm2.toLowerCase())
);

// Lógica de paginación
const indexOfLastRecord2 = currentPage2 * recordsPerPage2;
const indexOfFirstRecord2 = indexOfLastRecord2 - recordsPerPage2;
const currentRecords2 = filteredHijos.slice(indexOfFirstRecord2, indexOfLastRecord2);

// Cambiar página
const paginate2 = (pageNumber) => {
if (pageNumber > 0 && pageNumber <= Math.ceil(filteredHijos.length / recordsPerPage2)) {
  setCurrentPage2(pageNumber);
}
}
//------------------------------------------------------------------------------------------------------
 

 // Verificar permisos
 if (!canSelect) {
  return <AccessDenied />;
}


return (
    <CContainer className="py-1">
       {cargando && ( 
          <div className="text-center my-5">
            <CSpinner color="primary" aria-label="Cargando información..." />
          </div>
        )}
        {!cargando && currentView === 'hijos' && (
           <>
          <CRow className="align-items-center mb-5">
            <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"> 
             
            <div className="flex-grow-1 text-center">
                <h4 className="text-center fw-semibold pb-2 mb-0" style={{display: "inline-block", borderBottom: "2px solid #4CAF50" }}> Cuadros: Mis Hijos</h4>
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
                  style={{ width: '80px',height:'35px', display: 'inline-block',fontSize: '0.8rem'}}
                    placeholder="Buscar estudiante..."
                    onChange={handleSearch2}
                    value={searchTerm2}
                    onPaste={disableCopyPaste}
                    onCopy={disableCopyPaste}
                  />
                  <CButton
                    style={{border: '1px solid #ccc',
                      transition: 'all 0.1s ease-in-out', // Duración de la transición
                      backgroundColor: '#F3F4F7', // Color por defecto
                      color: '#343a40', // Color de texto por defecto
                      height:'35px'
                    }}
                    onClick={() => {
                      setSearchTerm2('');
                      setCurrentPage2(1);
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
                <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
                  <div className="d-inline-flex align-items-center">
                    <span style={{ fontSize: '0.85rem' }}>Mostrar&nbsp;</span>
                      <CFormSelect
                        style={{ width: '80px',height:'35px', display: 'inline-block', textAlign: 'center' }}
                        onChange={(e) => {
                        const value = Number(e.target.value);
                        setRecordsPerPage2(value);
                        setCurrentPage2(1); // Reiniciar a la primera página cuando se cambia el número de registros
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
              <div className="table-responsive" style={{maxHeight: '400px',overflowX: 'auto',overflowY: 'auto', boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)"}}>
                 <CTable striped bordered hover responsive >
                 <CTableHead className="sticky-top bg-light text-center" style={{fontSize: '0.8rem'}}>
                 <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        <CTableHeaderCell>IDENTIDAD</CTableHeaderCell>
                        <CTableHeaderCell>NOMBRE ESTUDIANTE</CTableHeaderCell>
                        <CTableHeaderCell>GRADO</CTableHeaderCell>
                        <CTableHeaderCell>SECCIÓN</CTableHeaderCell>
                        <CTableHeaderCell>ACCIÓN</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody className="text-center" style={{fontSize: '0.85rem',}}>
                    {currentRecords2.length > 0 ? (
                      currentRecords2.map((hijo, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>{index + 1}</CTableDataCell>
                          <CTableDataCell>{hijo.DNI}</CTableDataCell>
                          <CTableDataCell>{hijo.Nombre_Completo}</CTableDataCell>
                          <CTableDataCell>{hijo.nombre_grado}</CTableDataCell>
                          <CTableDataCell>{hijo.nombre_seccion}</CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              size="sm"
                              style={{
                                backgroundColor: "#F0F4F3",
                                color: "#153E21",
                                border: "1px solid #A2B8A9",
                                borderRadius: "6px",
                                padding: "5px 12px",
                                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                              }}
                              onMouseEnter={(e) => (e.target.style.backgroundColor = "#dce3dc")}
                              onMouseLeave={(e) => (e.target.style.backgroundColor = "#F0F4F3")}
                              onClick={() => fetchCuadroNotas(hijo.cod_seccion_matricula, hijo.Nombre_Completo, hijo.DNI,hijo.nombre_grado,hijo.nombre_seccion)}
                            >
                              Ver Cuadro
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="5">No se encontraron resultados</CTableDataCell>
                      </CTableRow>
                    )}
                    </CTableBody>
                  </CTable>
                  </div>
                   {/* Paginación Fija */}
                  <div style={{ display: 'flex',  justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
                    <CPagination aria-label="Page navigation" style={{ display: 'flex', gap: '10px' }}>
                      <CButton
                        style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
                        disabled={currentPage2 === 1} // Deshabilitar si estás en la primera página
                        onClick={() => paginate2(currentPage2 - 1)}>
                        Anterior
                      </CButton>
                      <CButton
                        style={{ marginLeft: '10px',backgroundColor: '#6f8173', color: '#D9EAD3' }}
                        disabled={currentPage2 === Math.ceil(filteredHijos.length / recordsPerPage2)} // Deshabilitar si estás en la última página
                        onClick={() => paginate2(currentPage2 + 1)}>
                        Siguiente
                    </CButton>
                  </CPagination>
                    {/* Mostrar total de páginas */}
                    <span style={{ marginLeft: '10px' }}>
                      Página {currentPage2} de {Math.ceil(filteredHijos.length / recordsPerPage2)}
                    </span>
                </div>
             </>
        )}

{!cargando && currentView === 'cuadroNotas' && (
  <>
     <CCol
  xs="12"
  className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
>
  {/* Botón Volver a Estudiantes */}
  <CButton
    className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
    style={{
      backgroundColor: "#656565",
      color: "#FFFFFF",
      padding: "6px 12px",
      fontSize: "0.9rem",
      transition: "background-color 0.2s ease, box-shadow 0.3s ease",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    }}
    onClick={() => setCurrentView('hijos')} // Regresa a la vista de estudiantes
  >
    <CIcon icon={cilArrowLeft} /> Volver a Hijos
  </CButton>

</CCol>

<div
  style={{
    width: "816px", // Carta width in pixels at 96 DPI
    height: "1056px", // Carta height in pixels at 96 DPI
    backgroundColor: "white", // Fondo blanco para un diseño limpio
    padding: "20px", // Opcional, para dar espacio interno
    boxSizing: "border-box", // Incluye el padding en el tamaño total
    justifyContent: "center",
  }}
  
>

    {/* Encabezado del reporte */}
    <div 
  style={{ 
    display: 'flex',  // Usamos flexbox para alinear los elementos en línea
    alignItems: 'center',  // Alineamos los elementos verticalmente al centro
    justifyContent: 'center',  // Alineamos todo el contenido a la izquierda
    textAlign: 'left',  // Alineamos el texto a la izquierda
    marginBottom: '10px', 
    flex: 1, 
    marginLeft: '-70px',
    padding: '5px',
    borderRadius: '8px',
    fontFamily: 'Arial Narrow, sans-serif', // Establecer fuente general
    fontSize: '1rem',
    
  }}
>
  {/* Logo a la izquierda */}
  <img 
    src={logo}  
    alt="Saint Patrick's Academy Logo" 
    style={{
      width: '200px', 
      height: '200px', 
      position: 'relative',  // Usamos posición relativa para moverlo
      left: '-80px',  // Desplazamos el logo hacia la izquierda
    }} 
  />
  
  {/* Contenedor de texto a la izquierda */}
  <div style={{ textAlign: 'center', marginTop: '-70px',transform: 'translateX(-10px)'   }}>
    {/* Título con Monotype Corsiva */}
    <h1 style={{
      fontSize: '2.333rem', 
      marginBottom: '10px',
      marginTop: '0', 
      fontFamily: 'Monotype Corsiva, cursive', 
      fontWeight: 'bold',
      color: '#000000',
    }}>
      Saint Patrick's Academy
    </h1>

    {/* Subtítulo con Arial Narrow */}
    <h2 style={{
      fontSize: '2.17rem', 
      marginBottom: '5px', 
      fontFamily: 'Monotype Corsiva, cursive',
      color: '#000000',
      marginTop: '0', 
      fontWeight: 'bold'
    }}>
      Report Card
    </h2>
  </div>
</div>


    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 30px', fontSize: '1.1rem', fontFamily: 'Arial Narrow, sans-serif', color: '#000000', marginTop:'30px' }}>
      <span style={{ display: 'flex', alignItems: 'center'}}>
        <strong style={{ fontWeight: 'bold' }}>Student Name:</strong>
        <span style={{ borderBottom: '1px solid black', paddingBottom: '2px', display: 'inline-block', flex: '1', marginLeft: '5px', letterSpacing: '0.5px' }}>
          {nombreEstudiante}
        </span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <strong style={{ fontWeight: 'bold' }}>Student ID:</strong>
        <span style={{ borderBottom: '1px solid black', paddingBottom: '2px', display: 'inline-block', flex: '1', marginLeft: '5px', letterSpacing: '0.5px' }}>
          {identidadEstudiante}
        </span>
      </span>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 30px', fontSize: '1.1rem', fontFamily: 'Arial Narrow, sans-serif', color: '#000000' , marginTop:'30px' }}>
      <span style={{ marginLeft: '40px' }}>
        <strong style={{ fontWeight: 'bold' }}>Grade: </strong>
        <span style={{ paddingBottom: '2px', display: 'inline-block', letterSpacing: '0.5px' }}> {gradoSeleccionado}</span>
      </span>
      <span style={{ marginLeft: '10px' }}><strong style={{ fontWeight: 'bold' }}>Section: </strong> {nombreSeccionSeleccionada}</span>
      <span style={{ marginRight: '40px' }}>
      <strong style={{ fontWeight: 'bold' }}>School year: </strong> {new Date().getFullYear()}-{new Date().getFullYear() + 1}</span>
    </div>


          
      <CTable className="table-bordered" style={{ border: '1px solid #000000', marginTop: '50px', fontSize: '0.8rem', lineHeight: '1', }}>
      <CTableHead>
  <CTableRow>
    <CTableHeaderCell 
      rowSpan={2} 
      className="text-center align-middle" 
      style={{ backgroundColor: '#BFBFBF'}}  // Color de fondo agregado
    >
      <div className="d-flex flex-column align-items-center justify-content-center">
        <span  style={{ marginBottom: '12px' }}>ÁREAS CURRICULARES/</span>
        <span style={{ marginTop: '5px' }}>CAMPOS DEL CONOCIMIENTO</span>
      </div>
    </CTableHeaderCell>

    <CTableHeaderCell
      rowSpan={1}
      colSpan={
        cuadroNotas.length > 0 
        ? cuadroNotas[0].NotasParciales.filter(p => !p.Parcial.match(/recu/i)).length 
        : 0
      }
      className="text-center align-middle"
      style={{
        backgroundColor: '#BFBFBF',
        borderBottom: '1px solid #000000',
        padding: '10px',
      }}
    >
      PARCIALES
    </CTableHeaderCell>

    {/* Aquí se muestra dinámicamente el nombre del parcial de recuperación si existe */}
    {cuadroNotas.length > 0 && cuadroNotas[0].NotasParciales.some(p => p.Parcial.match(/recu/i)) && (
          cuadroNotas[0].NotasParciales.filter(p => p.Parcial.match(/recu/i)).map((parcial, index) => (
            <CTableHeaderCell 
              key={index}
              rowSpan={2}
              className="text-center align-middle"
              style={{ backgroundColor: '#BFBFBF', padding: '10px' }}
            >
              {parcial.Parcial} {/* Nombre dinámico del parcial de recuperación */}
            </CTableHeaderCell>
          ))
        )}

      <CTableHeaderCell 
      rowSpan={2} 
      className="text-center align-middle" 
      style={{ backgroundColor: '#BFBFBF' }}
    >
      <div className="d-flex flex-column align-items-center justify-content-center">
        <span style={{ marginBottom: '12px' }}>NOTA</span>
        <span style={{ marginTop: '5px' }}>PROM.FINAL (%)</span>
      </div>
    </CTableHeaderCell>
  </CTableRow>

  <CTableRow>
     {/* Encabezados dinámicos para los parciales, excluyendo "Recuperación" */}
     {cuadroNotas.length > 0 &&
      cuadroNotas[0].NotasParciales.filter(p => !p.Parcial.match(/recu/i)).map((parcial, index) => (
        <CTableHeaderCell 
          key={index} 
          className="text-center" 
          style={{ backgroundColor: '#BFBFBF' }}
        >
          {parcial.Parcial}
        </CTableHeaderCell>
      ))}
  </CTableRow>
</CTableHead>


        <CTableBody >
          {cuadroNotas.length > 0 ? (
          cuadroNotas.map((nota, index) => (
            <CTableRow key={index}>
              {/* Celda combinada para el índice y la asignatura */}
              <CTableDataCell className="text-center bg-transparent" style={{ fontSize: '0.8rem', width: '350px' }}>
              <div className="d-flex justify-content-start">
                <span style={{ marginRight: '20px', marginLeft: '60px' }}>{index + 1}.</span> {/* Índice */}
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nota.Asignatura}</span> {/* Asignatura */}
              </div>
            </CTableDataCell>

            {/* Notas de parciales (sin "Recuperación" o palabras que contengan "recu") */}
          {nota.NotasParciales.filter(p => !p.Parcial.match(/recu/i)).map((parcial, i) => (
            <CTableDataCell key={i} className="text-center bg-transparent">
              {parcial.Nota}
            </CTableDataCell>
          ))}

            {/* Columna de Recuperación */}
        <CTableDataCell className="text-center bg-transparent">
          {
            nota.NotasParciales.find(p => p.Parcial.match(/recu/i))?.Nota || "-"
          }
        </CTableDataCell>
           {/* Columna Promedio Final */}
           <CTableDataCell className="text-center bg-transparent">
            {nota.PromedioFinal}
          </CTableDataCell>
          </CTableRow>
        ))
      ) : (
        <CTableRow>
          <CTableDataCell colSpan="5">No se encontraron resultados</CTableDataCell>
        </CTableRow>
      )}
      </CTableBody>
    </CTable>
    </div>
  </>
)}

 </CContainer>
);
};
export default ListaCuadroPadre;
