import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import { cilPen, cilTrash } from '@coreui/icons';
import swal from 'sweetalert2'; // Importar SweetAlert para mostrar mensajes de advertencia y éxito
import { jsPDF } from 'jspdf';       // Para generar archivos PDF
import 'jspdf-autotable';            // Para crear tablas en los archivos PDF
import * as XLSX from 'xlsx';        // Para generar archivos Excel
import { saveAs } from 'file-saver'; // Para descargar archivos en el navegador
import {
  CButton,
  CContainer,
  CDropdown, // Para reportes
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem, // Para reportes
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CPagination,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react';

const ListaActividades = () => {
  const [actividades, setActividades] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [nuevaActividad, setNuevaActividad] = useState({ Nombre: '', Descripcion: '', Hora_inicio: '', Hora_final: '', Nombre_seccion: '', Fecha: '' });
  const [actividadToUpdate, setActividadToUpdate] = useState({});
  const [actividadToDelete, setActividadToDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  useEffect(() => {
    fetchActividades();
  }, []);

  const fetchActividades = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/actividades/extracurriculares');
      const data = await response.json();
      const dataWithIndex = data.map((actividad, index) => ({
        ...actividad,
        originalIndex: index + 1,
      }));
      setActividades(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener las actividades extracurriculares:', error);
    }
  };

  const tieneLetrasRepetidas = (texto) => {
    const regex = /(.)\1{3,}/; // Detecta 4 o más letras consecutivas
    return regex.test(texto);
  };


    // Validar si hay más de un espacio consecutivo
  const tieneEspaciosMultiples = (texto) => {
    const regex = /^\S+(?: \S+)*$/; // Permite solo un espacio entre palabras
    return !regex.test(texto); // Retorna `true` si hay más de un espacio
  };
  

  const validarHoras = (horaInicio, horaFinal) => {
    const inicio = new Date(`1970-01-01T${horaInicio}:00`);
    const final = new Date(`1970-01-01T${horaFinal}:00`);
    return final > inicio;
  };

  

  
  const handleCreateActividad = async () => {
    const { Nombre, Descripcion, Nombre_seccion, Hora_inicio, Hora_final } = nuevaActividad;
  
    // Validar letras repetidas
    if (tieneLetrasRepetidas(Nombre)) {
      swal.fire({
        icon: 'warning',
        title: 'Repetición de letras',
        text: 'No se permite que la misma letra se repita más de 3 veces consecutivas en el nombre.',
      });
      return;
    }
    // Validar espacios múltiples
    if (tieneEspaciosMultiples(Nombre)) {
      swal.fire({
        icon: 'warning',
        title: 'Espacios múltiples',
        text: 'No se permite más de un espacio consecutivo en el nombre.',
      });
      return;
    }
    if (tieneLetrasRepetidas(Descripcion)) {
      swal.fire({
        icon: 'warning',
        title: 'Repetición de letras',
        text: 'No se permite que la misma letra se repita más de 3 veces consecutivas en la descripción.',
      });
      return;
    }
    if (tieneEspaciosMultiples(Descripcion)) {
      swal.fire({
        icon: 'warning',
        title: 'Espacios múltiples',
        text: 'No se permite más de un espacio consecutivo en la descripción.',
      });
      return;
    }
    
    if (tieneLetrasRepetidas(Nombre_seccion)) {
      swal.fire({
        icon: 'warning',
        title: 'Repetición de letras',
        text: 'No se permite que la misma letra se repita más de 3 veces consecutivas en la sección.',
      });
      return;
    }
    if (tieneEspaciosMultiples(Nombre_seccion)) {
      swal.fire({
        icon: 'warning',
        title: 'Espacios múltiples',
        text: 'No se permite más de un espacio consecutivo en la sección.',
      });
      return;
    }
  
    // Validar que la hora de finalización sea después de la hora de inicio
    if (!validarHoras(Hora_inicio, Hora_final)) {
      swal.fire({
        icon: 'warning',
        title: 'Error en las horas',
        text: 'La hora de finalización debe ser posterior a la hora de inicio.',
      });
      return;
    }
  
    // Si todas las validaciones pasan, se procede con la creación
    try {
      const response = await fetch('http://localhost:4000/api/actividades/extracurriculares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_Nombre: Nombre,
          p_Descripcion: Descripcion,
          p_Hora_inicio: Hora_inicio,
          p_Hora_final: Hora_final,
          p_Nombre_seccion: Nombre_seccion,
          p_Fecha: nuevaActividad.Fecha,
        }),
      });
  
      if (response.ok) {
        swal.fire({
          icon: 'success',
          title: 'Creación exitosa',
          text: 'La actividad ha sido creada correctamente.',
        });
        setModalVisible(false);
        fetchActividades();
        resetNuevaActividad();
      } else {
        const errorData = await response.json();
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: `No se pudo crear la actividad. Detalle: ${errorData.mensaje}`,
        });
      }
    } catch (error) {
      console.error('Error al crear la actividad:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al intentar crear la actividad.',
      });
    }
  };
  

  const handleUpdateActividad = async () => {
    try {
      const [year, month, day] = actividadToUpdate.Fecha.split('-');
      const formattedFecha = `${year}-${month}-${day}`;

      const response = await fetch('http://localhost:4000/api/actividades/extracurriculares', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_Cod_actividad: actividadToUpdate.Cod_actividades_extracurriculares,
          p_Nombre: actividadToUpdate.Nombre_actividad,
          p_Descripcion: actividadToUpdate.Descripcion,
          p_Hora_inicio: actividadToUpdate.Hora_inicio,
          p_Hora_final: actividadToUpdate.Hora_final,
          p_Nombre_seccion: actividadToUpdate.Nombre_seccion,
          p_Fecha: formattedFecha,
        }),
      });

      if (response.ok) {
        swal.fire({
          icon: 'success',
          title: 'Actualización exitosa',
          text: 'La actividad ha sido actualizada correctamente.',
        });
        setModalUpdateVisible(false);
        fetchActividades();
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar la actividad.',
        });
      }
    } catch (error) {
      console.error('Error al actualizar la actividad:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al intentar actualizar la actividad.',
      });
    }
  };

  const handleDeleteActividad = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/actividades/extracurriculares/${encodeURIComponent(actividadToDelete.Cod_actividades_extracurriculares)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        fetchActividades();
        setModalDeleteVisible(false);
        swal.fire({ icon: 'success', title: 'Eliminación exitosa', text: 'La actividad ha sido eliminada correctamente.' });
      } else {
        swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la actividad.' });
      }
    } catch (error) {
      console.error('Error al eliminar la actividad:', error);
    }
  };

  const resetNuevaActividad = () => {
    setNuevaActividad({ Nombre: '', Descripcion: '', Hora_inicio: '', Hora_final: '', Nombre_seccion: '', Fecha: '' });
  };

  const resetActividadToUpdate = () => {
    setActividadToUpdate({ Nombre_actividad: '', Descripcion: '', Hora_inicio: '', Hora_final: '', Nombre_seccion: '', Fecha: '' });
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(actividades);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Actividades');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'reporte_actividades.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Actividades Extracurriculares', 20, 10);
    doc.autoTable({
      head: [['#', 'Nombre de la Actividad', 'Descripción', 'Hora Inicio', 'Hora Final', 'Sección', 'Fecha']],
      body: currentRecords.map((actividad, index) => [
        index + 1,
        actividad.Nombre_actividad.toUpperCase(),
        actividad.Descripcion,
        actividad.Hora_inicio,
        actividad.Hora_final,
        actividad.Nombre_seccion,
        actividad.Fecha,
      ]),
    });
    doc.save('reporte_actividades_extracurriculares.pdf');
  };

  const openUpdateModal = (actividad) => {
    // Formatear la fecha si es necesario
    const formattedDate = actividad.Fecha ? new Date(actividad.Fecha).toISOString().split('T')[0] : '';
  
    setActividadToUpdate({
      Cod_actividades_extracurriculares: actividad.Cod_actividades_extracurriculares,
      Nombre_actividad: actividad.Nombre_actividad,
      Descripcion: actividad.Descripcion,
      Hora_inicio: actividad.Hora_inicio,
      Hora_final: actividad.Hora_final,
      Nombre_seccion: actividad.Nombre_seccion,
      Fecha: formattedDate,  // Asegúrate de que la fecha esté en el formato correcto
    });
  
    setModalUpdateVisible(true);
  };
  

  const openDeleteModal = (actividad) => {
    setActividadToDelete(actividad);
    setModalDeleteVisible(true);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const filteredActividades = actividades.filter((actividad) =>
    actividad.Nombre_actividad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredActividades.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredActividades.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <CContainer>
      <h1>Mantenimiento Actividades Extracurriculares</h1>

      {/* Botones "Nuevo" y "Reporte" alineados arriba */}
      <div className="d-flex justify-content-end mb-3">
        <CButton
          style={{ backgroundColor: '#4B6251', color: 'white', marginRight: '10px' }}
          onClick={() => {
            setModalVisible(true);
          }}
        >
          + Nueva
        </CButton>
        <CDropdown>
          <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white' }}>Reporte</CDropdownToggle>
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
          <CFormInput placeholder="Buscar por actividad" onChange={handleSearch} value={searchTerm} />
          <CButton
            style={{ backgroundColor: '#cccccc', color: 'black' }}
            onClick={() => {
              setSearchTerm('');
              setCurrentPage(1);
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
              setRecordsPerPage(Number(e.target.value));
              setCurrentPage(1);
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

      {/* Tabla de actividades */}
      <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', marginBottom: '30px' }}>
      <CTable striped>
  <CTableHead>
    <CTableRow>
      <CTableHeaderCell className="text-center" style={{ width: '5%' }}>
        #
      </CTableHeaderCell>
      <CTableHeaderCell style={{ width: '20%' }}>Nombre de la Actividad</CTableHeaderCell>
      <CTableHeaderCell style={{ width: '25%' }}>Descripción</CTableHeaderCell>
      <CTableHeaderCell className="text-center" style={{ width: '10%' }}>
        Hora de Inicio
      </CTableHeaderCell>
      <CTableHeaderCell className="text-center" style={{ width: '10%' }}>
        Hora de Finalización
      </CTableHeaderCell>
      <CTableHeaderCell className="text-center" style={{ width: '15%' }}>
        Nombre de la Sección
      </CTableHeaderCell>
      {/* Agregamos esta columna para la fecha */}
      <CTableHeaderCell className="text-center" style={{ width: '15%' }}>
        Fecha
      </CTableHeaderCell>
      <CTableHeaderCell className="text-center" style={{ width: '15%' }}>
        Acciones
      </CTableHeaderCell>
    </CTableRow>
  </CTableHead>
  <CTableBody>
  {currentRecords.map((actividad) => (
    <CTableRow key={actividad.Cod_actividades_extracurriculares}>
      <CTableDataCell className="text-center">{actividad.originalIndex}</CTableDataCell>
      <CTableDataCell style={{ textTransform: 'uppercase' }}>{actividad.Nombre_actividad}</CTableDataCell>
      <CTableDataCell style={{ textTransform: 'uppercase' }}>{actividad.Descripcion}</CTableDataCell>
      <CTableDataCell className="text-center">{actividad.Hora_inicio}</CTableDataCell>
      <CTableDataCell className="text-center">{actividad.Hora_final}</CTableDataCell>
      <CTableDataCell className="text-center" style={{ textTransform: 'uppercase' }}>
        {actividad.Nombre_seccion}
      </CTableDataCell>
      {/* Formateamos la fecha para mostrar solo YYYY-MM-DD */}
      <CTableDataCell className="text-center">
        {new Date(actividad.Fecha).toLocaleDateString('es-ES')}
      </CTableDataCell>
      <CTableDataCell className="text-center">
        <div className="d-flex justify-content-center">
          <CButton color="warning" onClick={() => openUpdateModal(actividad)} style={{ marginRight: '10px' }}>
            <CIcon icon={cilPen} />
          </CButton>
          <CButton color="danger" onClick={() => openDeleteModal(actividad)}>
            <CIcon icon={cilTrash} />
          </CButton>
        </div>
      </CTableDataCell>
    </CTableRow>
  ))}
</CTableBody>

</CTable>

      </div>

      {/* Paginación */}
      <CPagination align="center" aria-label="Page navigation example" activePage={currentPage} pages={Math.ceil(filteredActividades.length / recordsPerPage)} onActivePageChange={paginate} />

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
          disabled={currentPage === Math.ceil(filteredActividades.length / recordsPerPage)}
          onClick={() => paginate(currentPage + 1)}
        >
          Siguiente
        </CButton>
        <div style={{ marginLeft: '10px' }}>
          Página {currentPage} de {Math.ceil(filteredActividades.length / recordsPerPage)}
        </div>
      </div>

      {/* Modal Crear Actividad */}
      <CModal
  visible={modalVisible}
  onClose={() => {
    const { Nombre, Descripcion, Hora_inicio, Hora_final, Nombre_seccion, Fecha } = nuevaActividad;
    // Verificar si se ha ingresado algún dato en los campos del formulario
    if (Nombre || Descripcion || Hora_inicio || Hora_final || Nombre_seccion || Fecha) {
      // Si hay datos ingresados, mostrar alerta de confirmación
      swal.fire({
        title: '¿Estás seguro?',
        text: 'Si cierras este formulario, perderás todos los datos ingresados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          setModalVisible(false);
          resetNuevaActividad(); // Limpiar el formulario
        }
      });
    } else {
      // Si no hay datos ingresados, cerrar el modal directamente
      setModalVisible(false);
    }
  }}
  backdrop="static"
>
  <CModalHeader>
    <CModalTitle>Ingresar Actividad</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <CForm>
      <CFormInput
        label="Nombre de la Actividad"
        value={nuevaActividad.Nombre}
        maxLength={50}
        style={{ textTransform: 'uppercase' }}
        onChange={(e) => {
          const valor = e.target.value;
          if (!tieneLetrasRepetidas(valor)) {
            setNuevaActividad({ ...nuevaActividad, Nombre: valor });
          } else {
            swal.fire({
              icon: 'warning',
              title: 'Repetición de letras',
              text: 'No se permite que la misma letra se repita más de 3 veces consecutivas en el nombre.',
            });
          }
        }}
      />
      <CFormInput
        label="Descripción"
        value={nuevaActividad.Descripcion}
        maxLength={250}
        style={{ textTransform: 'uppercase' }}
        onChange={(e) => {
          const valor = e.target.value;
          if (!tieneLetrasRepetidas(valor)) {
            setNuevaActividad({ ...nuevaActividad, Descripcion: valor });
          } else {
            swal.fire({
              icon: 'warning',
              title: 'Repetición de letras',
              text: 'No se permite que la misma letra se repita más de 3 veces consecutivas en la descripción.',
            });
          }
        }}
      />
      <CFormInput
        label="Hora de inicio"
        type="time"
        value={nuevaActividad.Hora_inicio}
        onChange={(e) => setNuevaActividad({ ...nuevaActividad, Hora_inicio: e.target.value })}
      />
      <CFormInput
        label="Hora de finalización"
        type="time"
        value={nuevaActividad.Hora_final}
        onChange={(e) => setNuevaActividad({ ...nuevaActividad, Hora_final: e.target.value })}
      />
      <CFormInput
        label="Nombre de la Sección"
        value={nuevaActividad.Nombre_seccion}
        maxLength={50}
        style={{ textTransform: 'uppercase' }}
        onChange={(e) => {
          const valor = e.target.value;
          if (!tieneLetrasRepetidas(valor)) {
            setNuevaActividad({ ...nuevaActividad, Nombre_seccion: valor });
          } else {
            swal.fire({
              icon: 'warning',
              title: 'Repetición de letras',
              text: 'No se permite que la misma letra se repita más de 3 veces consecutivas en la sección.',
            });
          }
        }}
      />
      <CFormInput
        label="Fecha"
        type="date"
        value={nuevaActividad.Fecha}
        onChange={(e) => setNuevaActividad({ ...nuevaActividad, Fecha: e.target.value })}
      />
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton
      color="secondary"
      onClick={() => {
        const { Nombre, Descripcion, Hora_inicio, Hora_final, Nombre_seccion, Fecha } = nuevaActividad;
        if (Nombre || Descripcion || Hora_inicio || Hora_final || Nombre_seccion || Fecha) {
          swal.fire({
            title: '¿Estás seguro?',
            text: 'Si cierras este formulario, perderás todos los datos ingresados.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cerrar',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.isConfirmed) {
              setModalVisible(false);
              resetNuevaActividad(); // Limpiar el formulario
            }
          });
        } else {
          setModalVisible(false);
        }
      }}
    >
      Cancelar
    </CButton>
    <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={handleCreateActividad}>
      Guardar
    </CButton>
  </CModalFooter>
</CModal>

{/* Modal actualizar Actividad */}
<CModal
  visible={modalUpdateVisible}
  onClose={() => {
    const { Nombre_actividad, Descripcion, Hora_inicio, Hora_final, Nombre_seccion, Fecha } = actividadToUpdate;
    if (Nombre_actividad || Descripcion || Hora_inicio || Hora_final || Nombre_seccion || Fecha) {
      swal.fire({
        title: '¿Estás seguro?',
        text: 'Si cierras este formulario, perderás todos los datos ingresados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          setModalUpdateVisible(false);
          resetActividadToUpdate(); // Limpiar el formulario
        }
      });
    } else {
      setModalUpdateVisible(false);
    }
  }}
  backdrop="static"
>
  <CModalHeader>
    <CModalTitle>Actualizar Actividad</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <CForm>
      <CFormInput label="Identificador" value={actividadToUpdate.Cod_actividades_extracurriculares} readOnly />
      <CFormInput
        label="Nombre de la Actividad"
        value={actividadToUpdate.Nombre_actividad}
        maxLength={50}
        style={{ textTransform: 'uppercase' }}
        onChange={(e) => {
          const valor = e.target.value;
          if (!tieneLetrasRepetidas(valor)) {
            setActividadToUpdate({ ...actividadToUpdate, Nombre_actividad: valor });
          } else {
            swal.fire({
              icon: 'warning',
              title: 'Repetición de letras',
              text: 'No se permite que la misma letra se repita más de 3 veces consecutivas en el nombre.',
            });
          }
        }}
      />
      <CFormInput
        label="Descripción"
        value={actividadToUpdate.Descripcion}
        maxLength={250}
        style={{ textTransform: 'uppercase' }}
        onChange={(e) => {
          const valor = e.target.value;
          if (!tieneLetrasRepetidas(valor)) {
            setActividadToUpdate({ ...actividadToUpdate, Descripcion: valor });
          } else {
            swal.fire({
              icon: 'warning',
              title: 'Repetición de letras',
              text: 'No se permite que la misma letra se repita más de 3 veces consecutivas en la descripción.',
            });
          }
        }}
      />
      <CFormInput
        label="Hora de inicio"
        type="time"
        value={actividadToUpdate.Hora_inicio}
        onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Hora_inicio: e.target.value })}
      />
      <CFormInput
        label="Hora de finalización"
        type="time"
        value={actividadToUpdate.Hora_final}
        onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Hora_final: e.target.value })}
      />
      <CFormInput
        label="Nombre de la Sección"
        value={actividadToUpdate.Nombre_seccion}
        maxLength={50}
        style={{ textTransform: 'uppercase' }}
        onChange={(e) => {
          const valor = e.target.value;
          if (!tieneLetrasRepetidas(valor)) {
            setActividadToUpdate({ ...actividadToUpdate, Nombre_seccion: valor });
          } else {
            swal.fire({
              icon: 'warning',
              title: 'Repetición de letras',
              text: 'No se permite que la misma letra se repita más de 3 veces consecutivas en la sección.',
            });
          }
        }}
      />
      <CFormInput
  label="Fecha"
  type="date"
  value={actividadToUpdate.Fecha || ''}  // Asegurarse de que la fecha está bien formateada
  onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Fecha: e.target.value })}  // Cambiar solo si el usuario la modifica
/>

    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton
      color="secondary"
      onClick={() => {
        const { Nombre_actividad, Descripcion, Hora_inicio, Hora_final, Nombre_seccion, Fecha } = actividadToUpdate;
        if (Nombre_actividad || Descripcion || Hora_inicio || Hora_final || Nombre_seccion || Fecha) {
          swal.fire({
            title: '¿Estás seguro?',
            text: 'Si cierras este formulario, perderás todos los datos ingresados.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cerrar',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.isConfirmed) {
              setModalUpdateVisible(false);
              resetActividadToUpdate(); // Limpiar el formulario
            }
          });
        } else {
          setModalUpdateVisible(false);
        }
      }}
    >
      Cancelar
    </CButton>
    <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={handleUpdateActividad}>
      Guardar
    </CButton>
  </CModalFooter>
</CModal>



      {/* Modal Eliminar Actividad */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Eliminar Actividad</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Estás seguro de que deseas eliminar la actividad "{actividadToDelete.Nombre_actividad}"?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={handleDeleteActividad}>
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaActividades;
