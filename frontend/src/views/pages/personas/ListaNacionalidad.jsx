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
import { cilSearch, cilPen, cilTrash, cilPlus, cilSave, cilDescription, cilWarning } from "@coreui/icons";
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
  const [nuevaNacionalidad, setNuevaNacionalidad] = useState({
    Id_nacionalidad: "",
    pais_nacionalidad: "",
    pais: "",
  });
  const [errors, setErrors] = useState({
    Id_nacionalidad: "",
    pais_nacionalidad: "",
    pais: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    fetchNacionalidades();
  }, []);

  const fetchNacionalidades = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/nacionalidad/verNacionalidades");
      if (!response.ok) throw new Error("Error al cargar nacionalidades");
      const data = await response.json();
      
      // Ordenar alfabéticamente por Id_nacionalidad
      const sortedData = data.sort((a, b) => a.Id_nacionalidad.localeCompare(b.Id_nacionalidad));
  
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
  
  const handleCreateOrUpdateNacionalidad = async () => {
    if (isSubmitting) return;
  
    const errorsTemp = {};
  
    // Validar campos vacíos
    if (!nuevaNacionalidad.Id_nacionalidad.trim()) {
      errorsTemp.Id_nacionalidad = 'El campo "Id Nacionalidad" no puede estar vacío.';
    }
  
    if (!nuevaNacionalidad.pais_nacionalidad.trim()) {
      errorsTemp.pais_nacionalidad = 'El campo "País Nacionalidad" no puede estar vacío.';
    }
  
    if (!nuevaNacionalidad.pais.trim()) {
      errorsTemp.pais = 'El campo "País" no puede estar vacío.';
    }
  
    // Validar si contiene al menos una vocal
    const vocalRegex = /[AEIOUÁÉÍÓÚÜÑ]/i;
    if (nuevaNacionalidad.pais_nacionalidad.trim() && !vocalRegex.test(nuevaNacionalidad.pais_nacionalidad)) {
      errorsTemp.pais_nacionalidad = 'El campo "País Nacionalidad" debe contener al menos una vocal.';
    }
  
    if (nuevaNacionalidad.pais.trim() && !vocalRegex.test(nuevaNacionalidad.pais)) {
      errorsTemp.pais = 'El campo "País" debe contener al menos una vocal.';
    }
  
    // Si hay errores, establecerlos y salir
    if (Object.keys(errorsTemp).length > 0) {
      setErrors(errorsTemp);
  
      // Limpiar los errores automáticamente después de 5 segundos
      setTimeout(() => {
        setErrors({});
      }, 5000);
      return;
    }
  
    // Validar duplicados
    const duplicados = [];
    if (
      nacionalidades.some(
        (item) =>
          item.Id_nacionalidad.toUpperCase() === nuevaNacionalidad.Id_nacionalidad.trim().toUpperCase() &&
          (!nacionalidadToEdit || item.Cod_nacionalidad !== nacionalidadToEdit.Cod_nacionalidad)
      )
    ) {
      duplicados.push(`<b>El Id Nacionalidad "${nuevaNacionalidad.Id_nacionalidad.trim()}" ya existe.</b>`);
    }
  
    if (
      nacionalidades.some(
        (item) =>
          item.pais_nacionalidad.toUpperCase() === nuevaNacionalidad.pais_nacionalidad.trim().toUpperCase() &&
          (!nacionalidadToEdit || item.Cod_nacionalidad !== nacionalidadToEdit.Cod_nacionalidad)
      )
    ) {
      duplicados.push(`<b>El País Nacionalidad "${nuevaNacionalidad.pais_nacionalidad.trim()}" ya existe.</b>`);
    }
  
    if (
      nacionalidades.some(
        (item) =>
          item.pais.toUpperCase() === nuevaNacionalidad.pais.trim().toUpperCase() &&
          (!nacionalidadToEdit || item.Cod_nacionalidad !== nacionalidadToEdit.Cod_nacionalidad)
      )
    ) {
      duplicados.push(`<b>El País "${nuevaNacionalidad.pais.trim()}" ya existe.</b>`);
    }
  
    // Mostrar errores de duplicados
    if (duplicados.length > 0) {
      const mensaje = duplicados.join('<br>');
      swal.fire({
        icon: "error",
        html: mensaje,
        timer: 4000,
        showConfirmButton: false,
      });
      return;
    }
  
    setErrors({});
    setIsSubmitting(true);
  
    const url = nacionalidadToEdit
      ? `http://localhost:4000/api/nacionalidad/actualizarNacionalidades/${nacionalidadToEdit.Cod_nacionalidad}`
      : "http://localhost:4000/api/nacionalidad/crearNacionalidades";
  
    const method = nacionalidadToEdit ? "PUT" : "POST";
  
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaNacionalidad),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        if (nacionalidadToEdit) {
          setNacionalidades((prevNacionalidades) =>
            prevNacionalidades.map((item) =>
              item.Cod_nacionalidad === nacionalidadToEdit.Cod_nacionalidad ? nuevaNacionalidad : item
            )
          );
          swal.fire({
            icon: "success",
            html: "<b>Nacionalidad actualizada exitosamente.</b>",
            timer: 3000,
            showConfirmButton: false,
          });
        } else {
          setNacionalidades((prevNacionalidades) => [...prevNacionalidades, result]);
          swal.fire({
            icon: "success",
            html: "<b>Nacionalidad creada exitosamente.</b>",
            timer: 3000,
            showConfirmButton: false,
          });
        }
        setModalVisible(false);
        setNuevaNacionalidad({ Id_nacionalidad: "", pais_nacionalidad: "", pais: "" });
        setNacionalidadToEdit(null);
        await fetchNacionalidades();
      } else {
        swal.fire({
          icon: "error",
          html: `<b>${result.Mensaje}</b>`,
          timer: 3000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      swal.fire({
        icon: "error",
        html: "<b>Error en el servidor.</b>",
        timer: 3000,
        showConfirmButton: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleDeleteNacionalidad = async (Cod_nacionalidad, Id_nacionalidad) => {
    try {
      console.log("Intentando eliminar nacionalidad:", Cod_nacionalidad, Id_nacionalidad);
  
      const confirmResult = await swal.fire({
        title: "Confirmar Eliminación",
        html: `¿Estás seguro de que deseas eliminar la nacionalidad: <strong>${Id_nacionalidad || "N/A"}</strong>?`,
        showCancelButton: true,
        confirmButtonColor: "#FF6B6B", // Color rojo para el botón de confirmar
        cancelButtonColor: "#6C757D", // Color gris para el botón de cancelar
        cancelButtonText: "Cancelar",
        confirmButtonText: '<i class="fa fa-trash"></i> Eliminar',
        reverseButtons: true,
        focusCancel: true, // Enfoca el botón de cancelar
      });
  
      if (!confirmResult.isConfirmed) return;
  
      console.log("Enviando solicitud DELETE...");
  
      const response = await fetch(
        `http://localhost:4000/api/nacionalidad/eliminarNacionalidades/${encodeURIComponent(Cod_nacionalidad)}`,
        {
          method: "DELETE",
        }
      );
  
      console.log("Respuesta del servidor:", response);
  
      const result = await response.json();
      console.log("Resultado del servidor:", result);
  
      if (response.ok) {
        setNacionalidades((prevNacionalidades) =>
          prevNacionalidades.filter((item) => item.Cod_nacionalidad !== Cod_nacionalidad)
        );
        swal.fire({
          icon: "success",
          html: "<b>Nacionalidad eliminada exitosamente</b>",
          timer: 3000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(result.Mensaje || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error eliminando la nacionalidad:", error);
      swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo eliminar la nacionalidad.",
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };
  
  
  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reiniciar a la primera página
  };

  const filteredNacionalidades = nacionalidades.filter((nac) =>
    nac.Id_nacionalidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nac.pais_nacionalidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nac.pais.toLowerCase().includes(searchTerm.toLowerCase())
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
        style={{ backgroundColor: "#4B6251", color: "white", marginRight: "10px" }}
        onClick={() => {
          setModalVisible(true);
          setNacionalidadToEdit(null);
          setNuevaNacionalidad({ Id_nacionalidad: "", pais_nacionalidad: "", pais: "" });
        }}
      >
        <CIcon icon={cilPlus} /> Nuevo
      </CButton>
      <CButton
        style={{ backgroundColor: "#6C8E58", color: "white" }}
        onClick={exportToPDF} // Función de reporte general
      >
        <CIcon icon={cilDescription} /> Descargar PDF
      </CButton>
      <div className="mt-2" style={{ textAlign: "right" }}>
        <span>Mostrar </span>
        <CFormSelect
          value={recordsPerPage}
          onChange={handleRecordsPerPageChange}
          style={{ maxWidth: "70px", display: "inline-block", margin: "0 5px" }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </CFormSelect>
        <span> registros</span>
      </div>
    </CCol>
  </CRow>

  <CInputGroup className="mb-3" style={{ maxWidth: "400px" }}>
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
      onClick={() => setSearchTerm("")}
    >
      <i className="fa fa-broom" style={{ marginRight: "5px" }}></i> Limpiar
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
                setNuevaNacionalidad(nac);
                setModalVisible(true);
              }}
            >
              <CIcon icon={cilPen} /> 
            </CButton>
            <CButton
  color="danger"
  size="sm"
  className="ms-2"
  onClick={() => handleDeleteNacionalidad(nac.Cod_nacionalidad, nac.Id_nacionalidad)}
>
  <CIcon icon={cilTrash} />
</CButton>

            <CButton
              color="info"
              size="sm"
              className="ms-2"
              onClick={() => exportIndividualToPDF(nac)} // Función de reporte individual
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
      <CModalTitle>
        {nacionalidadToEdit ? "Actualizar Nacionalidad" : "Nueva Nacionalidad"}
      </CModalTitle>
    </CModalHeader>
    <CModalBody>
  {/* Campo Id Nacionalidad */}
  <CInputGroup className="mb-3">
    <CInputGroupText>Id Nacionalidad</CInputGroupText>
    <CFormInput
      placeholder="Ingrese ID Nacionalidad"
      value={nuevaNacionalidad.Id_nacionalidad}
      onChange={(e) => {
        let value = e.target.value
          .replace(/[^A-Za-zÁÉÍÓÚÜÑ0-9 ]/gi, '') // Permitir solo letras, números y espacios
          .replace(/^\s+/, '') // Eliminar espacios al inicio
          .replace(/\s{2,}/g, ' ') // Reemplazar múltiples espacios por uno
          .toUpperCase(); // Convertir a mayúsculas

        if (value.length <= 25) {
          setNuevaNacionalidad({ ...nuevaNacionalidad, Id_nacionalidad: value });
        }
      }}
      onKeyDown={(e) => {
        if (nuevaNacionalidad.Id_nacionalidad.length >= 25 && e.key !== "Backspace") {
          e.preventDefault();
        }
      }}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
    />
  </CInputGroup>
  {errors.Id_nacionalidad && (
    <div style={{ marginTop: "5px", fontSize: "0.9rem", fontWeight: "bold", color: "#000000", display: "flex", alignItems: "center" }}>
      <CIcon icon={cilWarning} style={{ color: "#FFC107", marginRight: "5px", fontSize: "1.2rem" }} />
      {errors.Id_nacionalidad}
    </div>
  )}

  {/* Campo País Nacionalidad */}
  <CInputGroup className="mb-3">
    <CInputGroupText>País Nacionalidad</CInputGroupText>
    <CFormInput
      placeholder="Ingrese País Nacionalidad"
      value={nuevaNacionalidad.pais_nacionalidad}
      onChange={(e) => {
        let value = e.target.value
          .replace(/[^A-Za-zÁÉÍÓÚÜÑ ]/gi, '') // Permitir solo letras y espacios
          .replace(/^\s+/, '') // Eliminar espacios al inicio
          .replace(/\s{2,}/g, ' ') // Reemplazar múltiples espacios por uno
          .toUpperCase();

        if (value.length <= 100) {
          setNuevaNacionalidad({ ...nuevaNacionalidad, pais_nacionalidad: value });
        }
      }}
      onKeyDown={(e) => {
        if (nuevaNacionalidad.pais_nacionalidad.length >= 100 && e.key !== "Backspace") {
          e.preventDefault();
        }
      }}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
    />
  </CInputGroup>
  {errors.pais_nacionalidad && (
    <div style={{ marginTop: "5px", fontSize: "0.9rem", fontWeight: "bold", color: "#000000", display: "flex", alignItems: "center" }}>
      <CIcon icon={cilWarning} style={{ color: "#FFC107", marginRight: "5px", fontSize: "1.2rem" }} />
      {errors.pais_nacionalidad}
    </div>
  )}

  {/* Campo País */}
  <CInputGroup className="mb-3">
    <CInputGroupText>País</CInputGroupText>
    <CFormInput
      placeholder="Ingrese País"
      value={nuevaNacionalidad.pais}
      onChange={(e) => {
        let value = e.target.value
          .replace(/[^A-Za-zÁÉÍÓÚÜÑ ]/gi, '') // Permitir solo letras y espacios
          .replace(/^\s+/, '') // Eliminar espacios al inicio
          .replace(/\s{2,}/g, ' ') // Reemplazar múltiples espacios por uno
          .toUpperCase();

        if (value.length <= 250) {
          setNuevaNacionalidad({ ...nuevaNacionalidad, pais: value });
        }
      }}
      onKeyDown={(e) => {
        if (nuevaNacionalidad.pais.length >= 250 && e.key !== "Backspace") {
          e.preventDefault();
        }
      }}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
    />
  </CInputGroup>
  {errors.pais && (
    <div style={{ marginTop: "5px", fontSize: "0.9rem", fontWeight: "bold", color: "#000000", display: "flex", alignItems: "center" }}>
      <CIcon icon={cilWarning} style={{ color: "#FFC107", marginRight: "5px", fontSize: "1.2rem" }} />
      {errors.pais}
    </div>
  )}
</CModalBody>



    <CModalFooter>
      <CButton color="secondary" onClick={() => setModalVisible(false)}>
        Cancelar
      </CButton>
      <CButton
        onClick={handleCreateOrUpdateNacionalidad}
        style={{
          backgroundColor: nacionalidadToEdit ? "#FFD700" : "#4B6251",
          color: "white",
        }}
      >
        <CIcon icon={nacionalidadToEdit ? cilPen : cilSave} />
        &nbsp;
        {nacionalidadToEdit ? "Actualizar" : "Guardar"}
      </CButton>
    </CModalFooter>
  </CModal>
</CContainer>
  );
};

export default ListaNacionalidad;
