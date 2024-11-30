import React, { useEffect, useState } from "react";
import {
  CButton,
  CContainer,
  CInputGroup,
  CInputGroupText,
  CFormInput,
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
  CRow,
  CCol,
  CFormSelect,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilSearch, cilPen, cilTrash, cilPlus, cilDescription } from "@coreui/icons";
import swal from "sweetalert2";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import logo from 'src/assets/brand/logo_saint_patrick.png'; // Cambia la ruta al logo según tu proyecto

const ListaNacionalidad = () => {
  const [nacionalidades, setNacionalidades] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nacionalidadToEdit, setNacionalidadToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Número inicial de registros por página

  useEffect(() => {
    fetchNacionalidades();
  }, []);

  const fetchNacionalidades = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/nacionalidad/verNacionalidades");
      if (!response.ok) throw new Error("Error al cargar nacionalidades");
      const data = await response.json();
      // Ordenar las nacionalidades alfabéticamente por el campo 'pais'
      const sortedData = data.sort((a, b) => a.pais.localeCompare(b.pais));
      setNacionalidades(sortedData);
    } catch (error) {
      console.error("Error:", error);
      swal.fire("Error", "No se pudieron cargar las nacionalidades.", "error");
    }
  };
  
  const exportToPDF = () => {
    const doc = new jsPDF();
  
    // Agregar logo
    doc.addImage(logo, 'PNG', 10, 10, 30, 30);
  
    // Nombre de la institución
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 51); // Verde oscuro
    doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
    // Subtítulo principal
    doc.setFontSize(14);
    doc.text('Reporte de Nacionalidades', doc.internal.pageSize.width / 2, 30, { align: 'center' });
  
    // Información adicional
    doc.setFontSize(10);
    doc.setTextColor(100); // Gris oscuro
    doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
    doc.text('Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 45, { align: 'center' });
  
    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51); // Verde oscuro
    doc.line(10, 55, doc.internal.pageSize.width - 10, 55);
  
    // Usar `filteredNacionalidades` para imprimir solo los datos filtrados
    doc.autoTable({
      startY: 60,
      head: [['#', 'Id Nacionalidad', 'País Nacionalidad', 'País']],
      body: filteredNacionalidades.map((item, index) => [
        index + 1,
        item.Id_nacionalidad,
        item.pais_nacionalidad,
        item.pais,
      ]),
      headStyles: { fillColor: [0, 102, 51], textColor: [255, 255, 255] }, // Estilo del encabezado
      alternateRowStyles: { fillColor: [240, 248, 255] }, // Estilo de filas alternas
      styles: { fontSize: 10, cellPadding: 3 },
    });
  
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
  
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
  
      // Información del pie
      const now = new Date();
      const dateString = now.toLocaleDateString('es-HN', { year: 'numeric', month: 'long', day: 'numeric' });
      const timeString = now.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
      doc.setFontSize(10);
      doc.setTextColor(0, 102, 51); // Verde oscuro
      doc.text(`Fecha de generación: ${dateString} Hora: ${timeString}`, 10, pageHeight - 10);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
    }
  
    // Abrir automáticamente
    const pdfBlobUrl = doc.output('bloburl');
    window.open(pdfBlobUrl); // Abre el archivo automáticamente en el navegador
  };
  
  
  const exportIndividualToPDF = (nac) => {
    const doc = new jsPDF();
  
    // Agregar logo
    doc.addImage(logo, 'PNG', 10, 10, 30, 30);
  
    // Nombre de la institución
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 51); // Verde oscuro
    doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
    // Título del reporte individual
    doc.setFontSize(14);
    doc.text(`Reporte Individual de Nacionalidad: ${nac.pais.toUpperCase()}`, doc.internal.pageSize.width / 2, 30, { align: 'center' });
  
    // Información adicional
    doc.setFontSize(10);
    doc.setTextColor(100); // Gris oscuro
    doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
    doc.text('Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 45, { align: 'center' });
  
    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51); // Verde oscuro
    doc.line(10, 55, doc.internal.pageSize.width - 10, 55);
  
    // Datos individuales en tabla estilizada
    doc.autoTable({
      startY: 60,
      head: [['Campo', 'Valor']], // Encabezados
      body: [
        ['Id Nacionalidad', nac.Id_nacionalidad],
        ['País Nacionalidad', nac.pais_nacionalidad],
        ['País', nac.pais],
      ],
      headStyles: { fillColor: [0, 102, 51], textColor: [255, 255, 255] }, // Encabezado verde oscuro
      alternateRowStyles: { fillColor: [240, 248, 255] }, // Filas alternas azul claro
      styles: { fontSize: 10, cellPadding: 3 },
    });
  
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
  
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
  
      // Fecha y hora de generación
      const now = new Date();
      const dateString = now.toLocaleDateString('es-HN', { year: 'numeric', month: 'long', day: 'numeric' });
      const timeString = now.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
      doc.setFontSize(10);
      doc.setTextColor(0, 102, 51); // Verde oscuro
      doc.text(`Fecha de generación: ${dateString} Hora: ${timeString}`, 10, pageHeight - 10);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
    }
  
    // Abrir automáticamente
    const pdfBlobUrl = doc.output('bloburl');
    window.open(pdfBlobUrl); // Abre el archivo automáticamente en el navegador
  };
  
  

  const handleSaveNacionalidad = async () => {
    try {
      const method = nacionalidadToEdit ? "PUT" : "POST";
      const url = nacionalidadToEdit
        ? `http://localhost:4000/api/nacionalidad/actualizarNacionalidades/${nacionalidadToEdit.Cod_nacionalidad}`
        : "http://localhost:4000/api/nacionalidad/crearNacionalidades";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nacionalidadToEdit),
      });

      if (!response.ok) throw new Error("Error al guardar nacionalidad");

      swal.fire("Éxito", "Nacionalidad guardada correctamente.", "success");
      fetchNacionalidades();
      setModalVisible(false);
      setNacionalidadToEdit(null);
    } catch (error) {
      console.error("Error:", error);
      swal.fire("Error", "No se pudo guardar la nacionalidad.", "error");
    }
  };

  const handleDeleteNacionalidad = async (Cod_nacionalidad) => {
    try {
      const result = await swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) return;

      const response = await fetch(
        `http://localhost:4000/api/nacionalidad/eliminarNacionalidades/${Cod_nacionalidad}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Error al eliminar nacionalidad");

      swal.fire("Eliminado", "Nacionalidad eliminada correctamente.", "success");
      fetchNacionalidades();
    } catch (error) {
      console.error("Error:", error);
      swal.fire("Error", "No se pudo eliminar la nacionalidad.", "error");
    }
  };

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reiniciar a la primera página
  };

  const filteredNacionalidades = nacionalidades.filter((nac) =>
    nac.pais_nacionalidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredNacionalidades.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredNacionalidades.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <CContainer>
      <CRow className="align-items-center mb-5">
  <CCol xs="8" md="9">
    <h1>Mantenimiento Nacionalidades</h1>
  </CCol>
  <CCol xs="4" md="3" className="text-end">
    <CButton
      style={{ backgroundColor: '#4B6251', color: 'white', marginRight: '10px' }}
      onClick={() => setModalVisible(true)}
    >
      <CIcon icon={cilPlus} /> Nuevo
    </CButton>
    <CButton
      style={{ backgroundColor: '#6C8E58', color: 'white' }}
      onClick={exportToPDF} // Llama a la función que genera el reporte general
    >
      <CIcon icon={cilDescription} /> Descargar PDF
    </CButton>
    <div className="mt-2" style={{ textAlign: 'right' }}>
      <span>Mostrar </span>
      <CFormSelect
        value={recordsPerPage}
        onChange={handleRecordsPerPageChange}
        style={{ maxWidth: '70px', display: 'inline-block', margin: '0 5px' }}
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
      </CFormSelect>
      <span> registros</span>
    </div>
  </CCol>
</CRow>


      <CInputGroup className="mb-3" style={{ maxWidth: '400px' }}>
        <CInputGroupText>
          <CIcon icon={cilSearch} />
        </CInputGroupText>
        <CFormInput
          placeholder="Buscar nacionalidad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CButton
  style={{
    backgroundColor: "#f0f0f0",
    border: "2px solid #d3d3d3",
    color: "#4B6251",
  }}
>
<i className="fa fa-broom" style={{ marginRight: '5px' }}></i> Limpiar
</CButton>

      </CInputGroup>



      <CTable striped bordered hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Id Nacionalidad</CTableHeaderCell>
            <CTableHeaderCell>País Nacionalidad</CTableHeaderCell>
            <CTableHeaderCell>País</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentRecords.map((nac, index) => (
            <CTableRow key={nac.Cod_nacionalidad}>
              <CTableDataCell>{index + 1 + indexOfFirstRecord}</CTableDataCell>
              <CTableDataCell>{nac.Id_nacionalidad}</CTableDataCell>
              <CTableDataCell>{nac.pais_nacionalidad}</CTableDataCell>
              <CTableDataCell>{nac.pais}</CTableDataCell>
              <CTableDataCell>
                <CButton
                  color="warning"
                  size="sm"
                  onClick={() => {
                    setNacionalidadToEdit(nac);
                    setModalVisible(true);
                  }}
                >
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton
                  color="danger"
                  size="sm"
                  className="ms-2"
                  onClick={() => handleDeleteNacionalidad(nac.Cod_nacionalidad)}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
                <CButton
  color="info"
  size="sm"
  className="ms-2"
  onClick={() => exportIndividualToPDF(nac)}
>
<CIcon icon={cilDescription} style={{ color: "black", marginRight: "5px" }} />
  Descargar PDF
</CButton>

              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CPagination align="center" className="my-3">
  <CButton
    style={{
      backgroundColor: "#7fa573", // Verde claro
      color: "white",
      padding: "10px 20px",
      marginRight: "10px",
      borderRadius: "5px",
      border: "none",
      fontSize: "16px",
    }}
    onClick={() => paginate(currentPage - 1)}
    disabled={currentPage === 1}
  >
    Anterior
  </CButton>
  <CButton
    style={{
      backgroundColor: "#7fa573", // Verde claro
      color: "white",
      padding: "10px 20px",
      marginLeft: "10px",
      borderRadius: "5px",
      border: "none",
      fontSize: "16px",
    }}
    onClick={() => paginate(currentPage + 1)}
    disabled={currentPage === totalPages || filteredNacionalidades.length === 0}
  >
    Siguiente
  </CButton>
  <span
    style={{
      marginLeft: "20px",
      color: "black",
      fontSize: "16px",
    }}
  >
    Página {currentPage} de {totalPages}
  </span>
</CPagination>


      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>{nacionalidadToEdit ? "Editar Nacionalidad" : "Nueva Nacionalidad"}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            label="Id Nacionalidad"
            value={nacionalidadToEdit?.Id_nacionalidad || ""}
            onChange={(e) =>
              setNacionalidadToEdit({ ...nacionalidadToEdit, Id_nacionalidad: e.target.value })
            }
            className="mb-3"
          />
          <CFormInput
            label="País Nacionalidad"
            value={nacionalidadToEdit?.pais_nacionalidad || ""}
            onChange={(e) =>
              setNacionalidadToEdit({ ...nacionalidadToEdit, pais_nacionalidad: e.target.value })
            }
            className="mb-3"
          />
          <CFormInput
            label="País"
            value={nacionalidadToEdit?.pais || ""}
            onChange={(e) => setNacionalidadToEdit({ ...nacionalidadToEdit, pais: e.target.value })}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleSaveNacionalidad}>
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaNacionalidad;
