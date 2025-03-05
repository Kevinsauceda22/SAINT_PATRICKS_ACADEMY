import React, { useEffect, useState } from 'react';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilDescription } from '@coreui/icons';
import swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import {
  CButton,
  CCol,
  CContainer,
  CDropdown,
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem,
  CForm,
  CFormSelect,
  CFormInput,
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

const ListaProcedenciaPersona = () => {
  // Estados
  const [procedenciaPersona, setProcedenciaPersona] = useState([]);
  const [procedencias, setProcedencias] = useState([]); // Lista de nombres de procedencias
  const [personas, setPersonas] = useState([]); // Lista de personas (nombre + primer apellido)
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [nuevoProcedencia, setNuevoProcedencia] = useState({ Cod_procedencia: '', Cod_persona: '', Anio_procedencia: '', Grado_procedencia: '' });
  const [procedenciaToUpdate, setProcedenciaToUpdate] = useState({});
  const [procedenciaToDelete, setProcedenciaToDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

  useEffect(() => {
    fetchProcedenciaPersona();
    fetchProcedencias();
    fetchPersonas();
  }, []);

  const fetchProcedenciaPersona = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/procedencia/persona/:cod_procedencia_persona`);
      const data = await response.json();
  
      // Agregar los nombres y apellidos a los registros
      const dataWithNames = await Promise.all(
        data.map(async (item) => {
          const { Nombre, Primer_apellido } = await fetchNombreApellido(item.Cod_persona);
          return {
            ...item,
            NombreCompleto: `${Nombre} ${Primer_apellido}`, // Combina nombre y apellido
          };
        })
      );
  
      // Agrega un índice original para la tabla
      const dataWithIndex = dataWithNames.map((item, index) => ({ ...item, originalIndex: index + 1 }));
      setProcedenciaPersona(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  };
  
  const fetchProcedencias = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/procedencia/procendencia');
      const data = await response.json();
      setProcedencias(data); // Asegúrate de que data contiene el formato esperado
    } catch (error) {
      console.error('Error al obtener procedencias:', error);
    }
  };
  
  const fetchPersonas = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/procedencia/total_personas');
      const data = await response.json();
      setPersonas(data); // Asegúrate de que data contiene el formato esperado
    } catch (error) {
      console.error('Error al obtener personas:', error);
    }
  };
  

  // Obtener el nombre y el apellido basado en cod_persona
const fetchNombreApellido = async (codPersona) => {
  try {
    const response = await fetch(`http://localhost:4000/api/procedencia/nombre/${codPersona}`);
    if (!response.ok) {
      console.error(`Error al obtener el nombre para cod_persona ${codPersona}:`, response.statusText);
      return { Nombre: 'Desconocido', Primer_apellido: '' }; // Fallback si falla
    }
    const data = await response.json();
    return { Nombre: data.Nombre, Primer_apellido: data.Primer_apellido };
  } catch (error) {
    console.error('Error en fetchNombreApellido:', error);
    return { Nombre: 'Desconocido', Primer_apellido: '' }; // Fallback si ocurre un error
  }
};

const handleInsertProcedenciaPersona = async () => {
  console.log('Estado nuevoProcedencia:', nuevoProcedencia); // Verifica el estado completo
  console.log('Procedencia seleccionada:', procedencias.find((p) => p.cod_procedencia === nuevoProcedencia.Cod_procedencia)?.Nombre_procedencia);
  console.log('Persona seleccionada:', personas.find((p) => p.cod_persona === nuevoProcedencia.Cod_persona)?.Nombre + ' ' +
               personas.find((p) => p.cod_persona === nuevoProcedencia.Cod_persona)?.Primer_apellido);

  if (
    !nuevoProcedencia.Cod_procedencia ||
    !nuevoProcedencia.Cod_persona ||
    !nuevoProcedencia.Anio_procedencia ||
    !nuevoProcedencia.Grado_procedencia
  ) {
    swal.fire('Error', 'Todos los campos son requeridos.', 'error');
    return;
  }

  try {
    const response = await fetch('http://localhost:4000/api/procedencia/crear_procedencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_Nombre_procedencia: procedencias.find((p) => p.cod_procedencia === nuevoProcedencia.Cod_procedencia)?.Nombre_procedencia,
        p_Nombre_persona: personas.find((p) => p.cod_persona === nuevoProcedencia.Cod_persona)?.Nombre + ' ' +
                         personas.find((p) => p.cod_persona === nuevoProcedencia.Cod_persona)?.Primer_apellido,
        p_Anio_procedencia: nuevoProcedencia.Anio_procedencia,
        p_Grado_procedencia: nuevoProcedencia.Grado_procedencia,
      }),
    });

    if (response.ok) {
      fetchProcedenciaPersona(); // Refrescar la tabla principal
      setModalVisible(false); // Cerrar el modal
      setNuevoProcedencia({ Cod_procedencia: '', Cod_persona: '', Anio_procedencia: '', Grado_procedencia: '' });
      swal.fire('Éxito', 'Registro agregado correctamente', 'success');
    } else {
      const errorData = await response.json();
      swal.fire('Error', errorData.mensaje || 'No se pudo agregar el registro', 'error');
    }
  } catch (error) {
    console.error('Error al agregar el registro:', error);
    swal.fire('Error', 'Hubo un problema con la conexión al servidor', 'error');
  }
};



  // Exportar a Excel
  const exportToExcel = () => {
    const formattedData = procedenciaPersona.map((item, index) => ({
      '#': index + 1,
      'Código de Procedencia': item.Cod_procedencia,
      'Código de Persona': item.Cod_persona,
      'Año de Procedencia': item.Anio_procedencia,
      'Grado de Procedencia': item.Grado_procedencia,
    }));
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Procedencia Persona');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'reporte_procedencia_persona.xlsx');
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Procedencia Persona', 20, 10);
    doc.autoTable({
      head: [['#', 'Código de Procedencia', 'Código de Persona', 'Año de Procedencia', 'Grado de Procedencia']],
      body: procedenciaPersona.map((item, index) => [
        index + 1,
        item.Cod_procedencia,
        item.Cod_persona,
        item.Anio_procedencia,
        item.Grado_procedencia,
      ]),
    });
    doc.save('reporte_procedencia_persona.pdf');
  };

  // Buscar
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const filteredProcedencias = procedenciaPersona.filter((item) =>
    item.Grado_procedencia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredProcedencias.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredProcedencias.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <CContainer>
      <CRow className="align-items-center mb-5">
        <CCol xs="8" md="9">
          <h2>Mantenimiento Procedencia Persona</h2>
        </CCol>
        <CCol xs="4" md="3" className="text-end">
          <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={() => setModalVisible(true)}>
            <CIcon icon={cilPlus} /> Nuevo
          </CButton>
          <CDropdown>
            <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white' }}>
              <CIcon icon={cilDescription} /> Reporte
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem onClick={exportToExcel}>Descargar en Excel</CDropdownItem>
              <CDropdownItem onClick={exportToPDF}>Descargar en PDF</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CCol>
      </CRow>

      <CInputGroup className="mb-3">
        <CInputGroupText>
          <CIcon icon={cilSearch} />
        </CInputGroupText>
        <CFormInput placeholder="Buscar grado de procedencia" onChange={handleSearch} value={searchTerm} />
      </CInputGroup>

      <CTable striped>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Nombre de la persona</CTableHeaderCell>
            <CTableHeaderCell>Año de procedencia</CTableHeaderCell>
            <CTableHeaderCell>Grado de procedencia</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentRecords.map((item, index) => (
            <CTableRow key={item.Cod_procedencia_persona}>
               <CTableDataCell>{indexOfFirstRecord+ index + 1}</CTableDataCell>
              <CTableDataCell>{item.NombreCompleto}</CTableDataCell>
              <CTableDataCell>{item.Anio_procedencia}</CTableDataCell>
              <CTableDataCell>{item.Grado_procedencia}</CTableDataCell>
              <CTableDataCell>
                <CButton color="warning" onClick={() => setModalUpdateVisible(true)}>
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton color="danger" onClick={() => setModalDeleteVisible(true)}>
                  <CIcon icon={cilTrash} />
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* Modal Crear Procedencia Persona */}
          <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
            <CModalHeader>
              <CModalTitle>Agregar procedencia persona</CModalTitle>
           
            </CModalHeader>
            <CModalBody>
              <CForm>
                {/* Selección de Procedencia */}
                                <CFormSelect
                  label="Nombre de Procedencia"
                  value={nuevoProcedencia.Cod_procedencia}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    console.log('Procedencia seleccionada:', value);
                    setNuevoProcedencia({ ...nuevoProcedencia, Cod_procedencia: value });
                  }}
                >
                  <option value="">Seleccione una Procedencia</option>
                  {procedencias.map((proc) => (
                    <option key={proc.cod_procedencia} value={proc.cod_procedencia}>
                      {proc.Nombre_procedencia}
                    </option>
                  ))}
                </CFormSelect>

                <CFormSelect
                  label="Nombre de Persona"
                  value={nuevoProcedencia.Cod_persona}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    console.log('Persona seleccionada:', value);
                    setNuevoProcedencia({ ...nuevoProcedencia, Cod_persona: value });
                  }}
                >
                  <option value="">Seleccione una Persona</option>
                  {personas.map((per) => (
                    <option key={per.cod_persona} value={per.cod_persona}>
                      {per.Nombre} {per.Primer_apellido}
                    </option>
                  ))}
                </CFormSelect>

                {/* Año de Procedencia */}
                <CFormInput
                  label="Año de Procedencia"
                  type="number"
                  value={nuevoProcedencia.Anio_procedencia}
                  onChange={(e) => setNuevoProcedencia({ ...nuevoProcedencia, Anio_procedencia: e.target.value })}
                />

                {/* Grado de Procedencia */}
                <CFormInput
                  label="Grado de Procedencia"
                  value={nuevoProcedencia.Grado_procedencia}
                  onChange={(e) => setNuevoProcedencia({ ...nuevoProcedencia, Grado_procedencia: e.target.value })}
                />
              </CForm>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setModalVisible(false)}>
                Cancelar
              </CButton>
              <CButton color="primary" onClick={handleInsertProcedenciaPersona}>
                Guardar
              </CButton>
            </CModalFooter>
          </CModal>


      <CPagination
        activePage={currentPage}
        pages={Math.ceil(filteredProcedencias.length / recordsPerPage)}
        onActivePageChange={paginate}
      />
    </CContainer>
  );
};

export default ListaProcedenciaPersona;
