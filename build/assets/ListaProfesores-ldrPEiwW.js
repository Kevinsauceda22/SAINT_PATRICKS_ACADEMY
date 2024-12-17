import{r as p,j as e,i as qe}from"./index-SVRFFNc9.js";import{C as E}from"./index.esm-DWwMdKxH.js";import{S as m}from"./sweetalert2.esm.all-D3pEHXw3.js";import{E as Je}from"./jspdf.plugin.autotable-gke1D7B3.js";import{u as Z,w as Ye}from"./xlsx-lwdk4T0U.js";import{l as Ke}from"./logo_saint_patrick-xw7Wl8f3.js";import{C as We}from"./CContainer-BdNP0s3v.js";import{C as de,a as pe}from"./CRow-Bf67u6lu.js";import{a as f}from"./CButton-D9GPTbB6.js";import{c as Ze}from"./cil-plus-D8mtC-W5.js";import{C as Qe,a as Xe,b as eo,c as me}from"./CDropdownToggle-DlfIUTmX.js";import{c as oo}from"./cil-file-CeQgYs_D.js";import{c as ro}from"./cil-spreadsheet-CJUvf_vM.js";import{C as u}from"./CInputGroup-D-McUFva.js";import{C}from"./CInputGroupText-Cfu0fzaY.js";import{c as ao}from"./cil-search-CDkY_4k-.js";import{C as y}from"./CFormInput-B_gylY64.js";import{c as to}from"./cil-brush-alt-CV61lKqC.js";import{C as so,a as no,b as he,c as F,d as io,e as T}from"./CTable-98qqrSRH.js";import{c as xe}from"./cil-pen-53d2I-C-.js";import{c as co}from"./cil-info-CmGCY32x.js";import{C as B,a as G,b as V,c as q}from"./CModalHeader-Bhtr3bZe.js";import{C as J}from"./CModalTitle-M2mBvD_5.js";import{C as ue}from"./CForm-CYRkMwLo.js";import{C as Y}from"./CFormSelect-CzT7g5tb.js";import{c as lo}from"./cil-save-CHBg7z_U.js";import{c as po}from"./cil-trash-CBbKHhHb.js";import"./CConditionalPortal-DwBsYzTA.js";import"./CFormControlWrapper-OEJgTi6e.js";import"./CFormControlValidation-CtDkyDfm.js";import"./CFormLabel-szm2Dda9.js";import"./CBackdrop-BbuVwMMD.js";const Vo=()=>{var ce,le;const[v,Ce]=p.useState([]),[ge,$]=p.useState(!1),[fe,O]=p.useState(!1),[_e,K]=p.useState(!1);p.useState(!1);const[be,W]=p.useState(!1),[s,_]=p.useState({Cod_profesor:"",cod_persona:"",Cod_grado_academico:"",Cod_tipo_contrato:"",Hora_entrada:"",Hora_salida:"",Fecha_ingreso:"",Fecha_fin_contrato:"",Años_experiencia:"",Estado:""}),[h,b]=p.useState({}),[Q,je]=p.useState({}),[A,ye]=p.useState({}),[j,X]=p.useState(""),[S,Se]=p.useState([]),[N,ve]=p.useState([]),[P,Ee]=p.useState([]),[Ne,Pe]=p.useState(1),[ee,mo]=p.useState(5),oe=p.useRef(null),[we,R]=p.useState(!1);p.useState(!1),v.Estado;const[Ae,De]=p.useState(v),[re,ae]=p.useState(!1);p.useEffect(()=>{M(),Fe(),ke(),He()},[]);const Fe=async()=>{try{const r=await(await fetch("http://74.50.68.87:4000/api/persona/verpersonas")).json();console.log("Datos obtenidos de la API:",r);const t=r.map((l,d)=>({...l,nombreCompleto:l.nombreCompleto||`${l.Nombre} ${l.Segundo_nombre} ${l.Primer_apellido} ${l.Segundo_Apellido}`.trim(),originalIndex:d+1}));Se(t)}catch(o){console.error("Error al obtener la lista de personas:",o)}},te=o=>{if(!S.length)return"Personas no disponibles";const r=S.find(t=>t.cod_persona===o);return r?r.nombreCompleto:"Persona no encontrada"},k=(o,r)=>{const t=o.target,l=t.selectionStart;let d=t.value.toUpperCase().trimStart();const a=d.split(" ");for(let i of a){const n={};for(let x of i)if(n[x]=(n[x]||0)+1,n[x]>4){m.fire({icon:"warning",title:"Repetición de letras",text:`La letra "${x}" se repite más de 4 veces en la palabra "${i}".`});return}}t.value=d,r(d),R(!0),requestAnimationFrame(()=>{oe.current&&oe.current.setSelectionRange(l,l)})},g=o=>{o.preventDefault(),m.fire({icon:"warning",title:"Accion bloquear",text:"Copiar y pegar no esta permitido"})},U=(o,r)=>{we?m.fire({title:"¿Estás seguro?",text:"Si cierras este formulario, perderás todos los datos ingresados.",icon:"warning",showCancelButton:!0,confirmButtonText:"Sí, cerrar",cancelButtonText:"Cancelar"}).then(t=>{t.isConfirmed&&(o(!1),r(),R(!1))}):(o(!1),r(),R(!1))},L=()=>_(""),Te=()=>b(""),ke=async()=>{try{const r=await(await fetch("http://74.50.68.87:4000/api/contratos/tiposContrato")).json();ve(r)}catch(o){console.error("Error al obtener la lista de tipos de contrato:",o)}},He=async()=>{try{const r=await(await fetch("http://74.50.68.87:4000/api/gradosAcademicos/verGradosAcademicos")).json();Ee(r)}catch(o){console.error("Error al obtener la lista de grados académicos:",o)}},M=async()=>{try{const r=await(await fetch("http://74.50.68.87:4000/api/profesores/verprofesores")).json();Ce(r)}catch(o){console.error("Error al obtener los profesores:",o)}},se=o=>o?new Date(o).toISOString().split("T")[0]:"Fecha no disponible",Re=async()=>{if(!s.cod_persona.trim()||!s.Cod_grado_academico.trim()||!s.Cod_tipo_contrato.trim()||!s.Hora_entrada.trim()||!s.Hora_salida.trim()||!s.Fecha_ingreso.trim()||!s.Fecha_fin_contrato.trim()||!s.Años_experiencia.trim()){m.fire({icon:"error",title:"Error",text:"Todos los campos deben de estar llenos"});return}if(v.some(a=>a.Cod_profesor===s.Cod_profesor?!1:(console.log(`Comparando: ${String(a.cod_persona)} con ${String(s.cod_persona)}`),String(a.cod_persona)===String(s.cod_persona)))){m.fire({icon:"error",title:"Error",text:"La persona seleccionada ya está registrada como profesor"});return}const r=new Date(`1970-01-01T${s.Hora_entrada}:00`),t=new Date(`1970-01-01T${s.Hora_salida}:00`);if(r>=t){m.fire({icon:"error",title:"Error",text:"La hora de entrada no puede ser mayor o igual que la hora de salida."});return}const l=new Date(s.Fecha_ingreso),d=new Date(s.Fecha_fin_contrato);if(l>d){m.fire({icon:"error",title:"Error",text:"La fecha de ingreso no puede ser mayor que la fecha de fin de contrato."});return}try{const a=await fetch("http://74.50.68.87:4000/api/profesores/crearprofesor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});a.ok?(M(),$(!1),L(),_({Cod_profesor:"",cod_persona:"",Cod_grado_academico:"",Cod_tipo_contrato:"",Hora_entrada:"",Hora_salida:"",Fecha_ingreso:"",Fecha_fin_contrato:"",Años_experiencia:""}),m.fire({icon:"success",title:"¡Éxito!",text:"El Profesor se ha creado correctamente"})):console.error("Hubo un problema al crear el profesor:",a.statusText)}catch(a){console.error("Hubo un problema al crear el profesor:",a)}},Ie=async()=>{if(Object.values(h).some(r=>r===""||r===null||r===void 0)){m.fire({icon:"error",title:"Error",text:"Todos los campos deben estar llenos."});return}try{const r=await fetch("http://74.50.68.87:4000/api/profesores/actualizarprofesor",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(h)});r.ok?(M(),O(!1),b({}),m.fire({icon:"success",title:"¡Éxito!",text:"El profesor se ha actualizado correctamente"})):(console.error("Error al actualizar el profesor:",r.statusText),m.fire({icon:"error",title:"Error",text:"No se pudo actualizar el profesor. Intente nuevamente."}))}catch(r){console.error("Error al actualizar el profesor:",r),m.fire({icon:"error",title:"Error",text:"Hubo un error en la conexión al servidor."})}},ze=async()=>{try{const o=await fetch("http://74.50.68.87:4000/api/profesores/eliminarprofesor",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({Cod_profesor:Q.Cod_profesor})});o.ok?(M(),K(!1),je({}),m.fire({icon:"success",title:"¡Éxito!",text:"El profesor se ha eliminado correctamente"})):console.error("Hubo un problema al eliminar el profesor",o.statusText)}catch(o){console.error("Hubo un problema al eliminar el profesor",o)}},$e=async o=>{const r=o.Estado?0:1;try{ae(!0);const t=await qe.post("http://74.50.68.87:4000/api/profesores/actualizarEstadoProfesor",{cod_profesor:o.Cod_profesor,estado:r});t.data.mensaje==="Estado actualizado exitosamente"?o.Estado=r:console.error("Error al cambiar el estado:",t.data.mensaje)}catch(t){console.error("Error al realizar la solicitud:",t)}finally{ae(!1)}},Oe=S.length>0?v.filter(o=>{var l;const r=S.find(d=>String(d.cod_persona).trim()===String(o.cod_persona).trim());return(((l=r==null?void 0:r.nombreCompleto)==null?void 0:l.toUpperCase().trim())||"").includes(j.trim().toUpperCase())}):[],ne=Ne*ee,Ue=ne-ee,ie=Oe.slice(Ue,ne);function Le({listaPersonas:o,nuevoProfesor:r,setNuevoProfesor:t}){const[l,d]=p.useState(""),[a,i]=p.useState(null),n=c=>{console.log("Persona seleccionada:",c),t(H=>({...H,cod_persona:c.cod_persona})),d(`${c.dni_persona} ${c.Nombre} ${c.Primer_apellido}`),i(c)},x=o.filter(c=>c.cod_tipo_persona===3&&`${c.dni_persona} ${c.Nombre} ${c.Primer_apellido}`.toUpperCase().includes(l)),w=c=>c.preventDefault();return e.jsxs(e.Fragment,{children:[e.jsxs(u,{className:"mb-3",children:[e.jsx(C,{children:"Nombre"}),e.jsx(y,{type:"text",placeholder:"Buscar por DNI, nombre o apellido...",value:l,onPaste:w,onCopy:w,onChange:c=>{d(c.target.value.toUpperCase()),i(null)},style:{padding:"10px",borderRadius:"4px",fontSize:"0.95rem",textTransform:"uppercase"}})]}),l&&e.jsx("div",{style:{maxHeight:"150px",overflowY:"auto",border:"1px solid #ddd",borderRadius:"4px",backgroundColor:"#fff",marginTop:"5px",boxShadow:"0 4px 8px rgba(0, 0, 0, 0.1)"},children:x.length>0?x.map(c=>e.jsxs("div",{onClick:()=>n(c),style:{padding:"10px",cursor:"pointer",backgroundColor:a&&a.cod_persona===c.cod_persona?"#e9ecef":"white",borderBottom:"1px solid #ddd"},children:[e.jsxs("strong",{children:[c.Nombre," ",c.Primer_apellido]}),e.jsx("br",{}),"DNI: ",c.dni_persona]},c.cod_persona)):e.jsx("div",{style:{padding:"10px",textAlign:"center"},children:"No se encontraron resultados."})})]})}console.log("Registros actuales en la página:",ie);const Me=o=>{b({...o,Fecha_ingreso:o.Fecha_ingreso?new Date(o.Fecha_ingreso).toISOString().split("T")[0]:"",Fecha_fin_contrato:o.Fecha_fin_contrato?new Date(o.Fecha_fin_contrato).toISOString().split("T")[0]:""}),O(!0),R(!1)};p.useEffect(()=>{De(j?v.filter(o=>{var a,i;const r=S.find(n=>n.cod_persona===o.cod_persona),t=r?`${r.dni_persona} ${r.Nombre} ${r.Primer_apellido}`.toUpperCase():"DESCONOCIDO",l=((a=N.find(n=>n.Cod_tipo_contrato===o.Cod_tipo_contrato))==null?void 0:a.Descripcion.toUpperCase())||"",d=((i=P.find(n=>n.Cod_grado_academico===o.Cod_grado_academico))==null?void 0:i.Descripcion.toUpperCase())||"";return t.includes(j.toUpperCase())||((r==null?void 0:r.dni_persona)||"").toUpperCase().includes(j.toUpperCase())||l.includes(j.toUpperCase())||d.includes(j.toUpperCase())}):v)},[j,v,S,N,P]);const Be=o=>{const r=o.target.value.toUpperCase().trim();if(!/^[A-ZÑ0-9\s]*$/.test(r)&&r!==""){m.fire({icon:"warning",title:"Entrada no válida",text:"Solo se permiten letras, números y espacios."});return}if(/([A-ZÑ0-9])\1{4}/.test(r)){m.fire({icon:"warning",title:"Entrada no válida",text:"No se permiten más de 4 caracteres repetidos consecutivamente."});return}if(/\s{2,}/.test(r)){m.fire({icon:"warning",title:"Entrada no válida",text:"No se permiten más de un espacio consecutivo."});return}X(r);const a=j?v.filter(i=>{var H,I;const n=S.find(D=>D.cod_persona===i.cod_persona),x=n?`${n.dni_persona} ${n.Nombre} ${n.Primer_apellido}`.toUpperCase():"DESCONOCIDO",w=((H=N.find(D=>D.Cod_tipo_contrato===i.Cod_tipo_contrato))==null?void 0:H.Descripcion)||"",c=((I=P.find(D=>D.Cod_grado_academico===i.Cod_grado_academico))==null?void 0:I.Descripcion)||"";return x.includes(j)||((n==null?void 0:n.dni_persona)||"").toUpperCase().includes(j)||w.toUpperCase().includes(j.toUpperCase())||c.toUpperCase().includes(j.toUpperCase())}):v;setProfesoresFiltrados(a)},Ge=()=>{const o=v.map((a,i)=>{var I,D;const n=S.find(z=>z.cod_persona===a.cod_persona),x=n?`${n.dni_persona} ${n.Nombre} ${n.Primer_apellido}`.toUpperCase():"DESCONOCIDO",w=((I=N.find(z=>z.Cod_tipo_contrato===a.Cod_tipo_contrato))==null?void 0:I.Descripcion.toUpperCase())||"N/A",c=((D=P.find(z=>z.Cod_grado_academico===a.Cod_grado_academico))==null?void 0:D.Descripcion.toUpperCase())||"N/A",H=a.Estado?"Activo":"Inactivo";return{index:i+1,nombreCompleto:x,gradoAcademico:c,tipoContrato:w,horaEntrada:a.Hora_entrada||"N/A",horaSalida:a.Hora_salida||"N/A",estado:H}});if(o.length===0){m.fire({icon:"warning",title:"Sin datos para el reporte",text:"No hay registros disponibles para generar el reporte."});return}const r=new Je,t=new Image;t.src=Ke;const l=new Date,d=`${l.toLocaleDateString()} ${l.toLocaleTimeString()}`;t.onload=()=>{r.addImage(t,"PNG",10,10,30,30);let a=20;r.setFontSize(18),r.setTextColor(0,102,51),r.text("SAINT PATRICK'S ACADEMY",r.internal.pageSize.width/2,a,{align:"center"}),a+=12,r.setFontSize(16),r.text("Reporte de Profesores",r.internal.pageSize.width/2,a,{align:"center"}),a+=10,r.setFontSize(10),r.setTextColor(100),r.text("Casa Club del periodista, Colonia del Periodista",r.internal.pageSize.width/2,a,{align:"center"}),a+=4,r.text("Teléfono: (504) 2234-8871",r.internal.pageSize.width/2,a,{align:"center"}),a+=4,r.text("Correo: info@saintpatrickacademy.edu",r.internal.pageSize.width/2,a,{align:"center"}),a+=6,r.setLineWidth(.5),r.setDrawColor(0,102,51),r.line(10,a,r.internal.pageSize.width-10,a),a+=6,r.autoTable({startY:a,head:[["#","DNI-Nombre","Grado Académico","Tipo de Contrato","Hora Entrada","Hora Salida","Estado"]],body:o.map(i=>[i.index,i.nombreCompleto,i.gradoAcademico,i.tipoContrato,i.horaEntrada,i.horaSalida,i.estado]),headStyles:{fillColor:[0,102,51],textColor:[255,255,255],fontSize:9},styles:{fontSize:8,cellPadding:2,overflow:"linebreak"},alternateRowStyles:{fillColor:[240,248,255]},didDrawPage:i=>{const n=r.internal.getNumberOfPages(),x=r.internal.pageSize.height;r.setFontSize(10),r.text(`Fecha y hora de generación: ${d}`,10,x-10),r.text(`Página ${i.pageNumber} de ${n}`,r.internal.pageSize.width-50,x-10)}}),window.open(r.output("bloburl"),"_blank")},t.onerror=()=>{console.warn("No se pudo cargar el logo. El PDF se generará sin el logo."),window.open(r.output("bloburl"),"_blank")}},Ve=()=>{const o=[["Saint Patrick Academy"],["Reporte de Profesores"],[],["#","Nombre","Grado Académico","Tipo de Contrato","Hora Entrada","Hora Salida"]],r=ie.map((d,a)=>{var x,w;const i=S.find(c=>c.cod_persona===d.cod_persona),n=i?`${i.dni_persona} ${i.Nombre} ${i.Primer_apellido}`:"Desconocido";return[a+1,n,((x=P.find(c=>c.Cod_grado_academico===d.Cod_grado_academico))==null?void 0:x.Descripcion)||"N/A",((w=N.find(c=>c.Cod_tipo_contrato===d.Cod_tipo_contrato))==null?void 0:w.Descripcion)||"N/A",d.Hora_entrada,d.Hora_salida]}),t=Z.aoa_to_sheet([...o,...r]),l=Z.book_new();Z.book_append_sheet(l,t,"Reporte Profesores"),Ye(l,"reporte_profesores.xlsx")};return e.jsxs(We,{children:[e.jsx(de,{className:"align-items-center mb-5",children:e.jsxs(pe,{xs:"12",className:"d-flex flex-column flex-md-row justify-content-between align-items-center gap-3",children:[e.jsx("div",{className:"d-flex justify-content-center align-items-center flex-grow-1",children:e.jsx("h1",{className:"text-center fw-semibold pb-2 mb-0",style:{display:"inline-block",borderBottom:"2px solid #4CAF50",margin:"0 auto",fontSize:"2.0rem"},children:"Lista de Profesores"})}),e.jsxs("div",{className:"d-flex gap-2",children:[e.jsxs(f,{className:"btn btn-sm d-flex align-items-center gap-1 rounded shadow",onClick:()=>{$(!0),R(!1)},style:{backgroundColor:"#4B6251",color:"#FFFFFF",padding:"5px 10px",fontSize:"0.9rem"},children:[e.jsx(E,{icon:Ze})," Nuevo"]}),e.jsxs(Qe,{className:"btn-sm d-flex align-items-center gap-1 rounded shadow",children:[e.jsx(Xe,{style:{backgroundColor:"#6C8E58",color:"white",fontSize:"0.85rem",cursor:"pointer",transition:"all 0.3s ease"},onMouseEnter:o=>{o.currentTarget.style.backgroundColor="#5A784C",o.currentTarget.style.boxShadow="0 4px 8px rgba(0, 0, 0, 0.2)"},onMouseLeave:o=>{o.currentTarget.style.backgroundColor="#6C8E58",o.currentTarget.style.boxShadow="none"},children:"Reporte"}),e.jsxs(eo,{style:{position:"absolute",zIndex:1050,backgroundColor:"#fff",boxShadow:"0px 2px 8px rgba(0, 0, 0, 0.2)",borderRadius:"4px",overflow:"hidden"},children:[e.jsxs(me,{onClick:Ge,style:{cursor:"pointer",outline:"none",backgroundColor:"transparent",padding:"0.5rem 1rem",fontSize:"0.85rem",color:"#333",borderBottom:"1px solid #eaeaea",transition:"background-color 0.3s"},onMouseOver:o=>o.target.style.backgroundColor="#f5f5f5",onMouseOut:o=>o.target.style.backgroundColor="transparent",children:[e.jsx(E,{icon:oo,size:"sm"})," Abrir en PDF"]}),e.jsxs(me,{onClick:Ve,style:{cursor:"pointer",outline:"none",backgroundColor:"transparent",padding:"0.5rem 1rem",fontSize:"0.85rem",color:"#333",transition:"background-color 0.3s"},onMouseOver:o=>o.target.style.backgroundColor="#f5f5f5",onMouseOut:o=>o.target.style.backgroundColor="transparent",children:[e.jsx(E,{icon:ro,size:"sm"})," Descargar Excel"]})]})]})]})]})}),e.jsx(de,{className:"align-items-center mt-4 mb-2",children:e.jsx(pe,{xs:"12",md:"8",className:"d-flex flex-wrap align-items-center",children:e.jsxs(u,{className:"me-3",style:{width:"400px"},children:[e.jsx(C,{children:e.jsx(E,{icon:ao,size:"sm"})}),e.jsx(y,{type:"text",placeholder:"Buscar por DNI, nombre, tipo de contrato o grado académico...",value:j,onChange:Be,style:{fontSize:"0.9rem"}}),e.jsxs(f,{style:{border:"1px solid #ccc",transition:"all 0.1s ease-in-out",backgroundColor:"#F3F4F7",color:"#343a40"},onClick:()=>{X(""),Pe(1)},onMouseEnter:o=>{o.currentTarget.style.backgroundColor="#E0E0E0",o.currentTarget.style.color="black"},onMouseLeave:o=>{o.currentTarget.style.backgroundColor="#F3F4F7",o.currentTarget.style.color="#343a40"},children:[e.jsx(E,{icon:to})," Limpiar"]})]})})}),e.jsx("div",{className:"table-responsive",style:{boxShadow:"0 4px 10px rgba(0, 0, 0, 0.3)"},children:e.jsxs(so,{striped:!0,bordered:!0,hover:!0,responsive:!0,children:[e.jsx(no,{className:"sticky-top bg-light text-start",style:{fontSize:"0.8rem"},children:e.jsxs(he,{children:[e.jsx(F,{children:"#"}),e.jsx(F,{children:"DNI-NOMBRE"}),e.jsx(F,{children:"GRADO ACADÉMICO"}),e.jsx(F,{children:"TIPO DE CONTRATO"}),e.jsx(F,{children:"HORA ENTRADA"}),e.jsx(F,{children:"HORA SALIDA"}),e.jsx(F,{children:"ACCIONES"})]})}),e.jsx(io,{children:Ae.map((o,r)=>{var a,i;const t=S.find(n=>n.cod_persona===o.cod_persona),l=t?`${t.dni_persona} ${t.Nombre} ${t.Primer_apellido}`:"Desconocido",d=o.Estado?{}:{backgroundColor:"#f0f0f0",opacity:.7};return e.jsxs(he,{style:d,children:[e.jsx(T,{children:r+1}),e.jsx(T,{children:l}),e.jsx(T,{children:((a=P.find(n=>n.Cod_grado_academico===o.Cod_grado_academico))==null?void 0:a.Descripcion)||"N/A"}),e.jsx(T,{children:((i=N.find(n=>n.Cod_tipo_contrato===o.Cod_tipo_contrato))==null?void 0:i.Descripcion)||"N/A"}),e.jsx(T,{children:o.Hora_entrada}),e.jsx(T,{children:o.Hora_salida}),e.jsxs(T,{children:[e.jsx(f,{style:{backgroundColor:"#F9B64E",marginRight:"10px",marginBottom:"10px"},onClick:()=>Me(o),disabled:!o.Estado,title:o.Estado?"Editar profesor":"Profesor inactivo",children:e.jsx(E,{icon:xe})}),e.jsx(f,{color:"primary",style:{marginRight:"10px",marginBottom:"10px"},onClick:()=>{ye(o),W(!0)},disabled:!o.Estado,title:o.Estado?"Ver detalles":"Profesor inactivo",children:e.jsx(E,{icon:co})}),e.jsxs(f,{style:{backgroundColor:o.Estado?"#4CAF50":"#F44336",color:"white",marginRight:"10px",marginBottom:"10px"},onClick:()=>$e(o),disabled:re,children:[re?"Cambiando...":o.Estado?"Activo":"Inactivo"," "]})]})]},o.Cod_profesor)})})]})}),e.jsxs(B,{visible:be,onClose:()=>W(!1),backdrop:"static",children:[e.jsx(G,{children:e.jsx(J,{children:"Detalles de profesor"})}),e.jsxs(V,{children:[e.jsx("h5",{children:"INFORMACIÓN"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Nombre:"})," ",te(A.cod_persona)]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Grado académico:"})," ",((ce=P.find(o=>o.Cod_grado_academico===A.Cod_grado_academico))==null?void 0:ce.Descripcion)||"N/A"]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Tipo de contrato:"})," ",((le=N.find(o=>o.Cod_tipo_contrato===A.Cod_tipo_contrato))==null?void 0:le.Descripcion)||"N/A"]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Hora Entrada:"})," ",A.Hora_entrada]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Hora Salida:"})," ",A.Hora_salida]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Fecha Ingreso:"})," ",se(A.Fecha_ingreso)]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Fecha Fin Contrato:"})," ",se(A.Fecha_fin_contrato)]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Años experiencia:"})," ",A.Años_experiencia]})]}),e.jsx(q,{children:e.jsx(f,{color:"secondary",onClick:()=>W(!1),children:"Cerrar"})})]}),e.jsxs(B,{visible:ge,backdrop:"static",children:[e.jsxs(G,{closeButton:!1,children:[e.jsx(J,{children:"Nuevo profesor"}),e.jsx(f,{className:"btn-close","aria-label":"Close",onClick:()=>U($,L)})]}),e.jsx(V,{children:e.jsxs(ue,{children:[e.jsx(Le,{listaPersonas:S,nuevoProfesor:s,setNuevoProfesor:_}),e.jsxs(u,{className:"mb-3",children:[e.jsx(C,{children:"Tipo de Contrato"}),e.jsxs(Y,{value:s.Cod_tipo_contrato,maxLength:50,onPaste:g,onCopy:g,onChange:o=>k(o,r=>_({...s,Cod_tipo_contrato:r})),children:[e.jsx("option",{value:"",children:"Seleccione tipo de contrato"}),N.map(o=>e.jsx("option",{value:o.Cod_tipo_contrato,children:o.Descripcion},o.Cod_tipo_contrato))]})]}),e.jsxs(u,{className:"mb-3",children:[e.jsx(C,{children:"Grado Académico"}),e.jsxs(Y,{value:s.Cod_grado_academico,maxLength:50,onPaste:g,onCopy:g,onChange:o=>k(o,r=>_({...s,Cod_grado_academico:r})),children:[e.jsx("option",{value:"",children:"Seleccione un grado académico"}),P.map(o=>e.jsx("option",{value:o.Cod_grado_academico,children:o.Descripcion},o.Cod_grado_academico))]})]}),e.jsxs(u,{className:"mb-3",children:[e.jsx(C,{children:"Hora Entrada"}),e.jsx(y,{type:"time",value:s.Hora_entrada,maxLength:50,onPaste:g,onCopy:g,onChange:o=>k(o,r=>_({...s,Hora_entrada:r}))})]}),e.jsxs(u,{className:"mb-3",children:[e.jsx(C,{children:"Hora Salida"}),e.jsx(y,{type:"time",value:s.Hora_salida,maxLength:50,onPaste:g,onCopy:g,onChange:o=>k(o,r=>_({...s,Hora_salida:r}))})]}),e.jsxs(u,{className:"mb-3",children:[e.jsx(C,{children:"Fecha Ingreso"}),e.jsx(y,{type:"date",value:s.Fecha_ingreso,maxLength:50,onPaste:g,onCopy:g,onChange:o=>k(o,r=>_({...s,Fecha_ingreso:r}))})]}),e.jsxs(u,{className:"mb-3",children:[e.jsx(C,{children:"Fecha Fin Contrato"}),e.jsx(y,{type:"date",value:s.Fecha_fin_contrato,maxLength:50,onPaste:g,onCopy:g,onChange:o=>k(o,r=>_({...s,Fecha_fin_contrato:r}))})]}),e.jsxs(u,{className:"mb-3",children:[e.jsx(C,{children:"Años de Experiencia"}),e.jsx(y,{type:"number",value:s.Años_experiencia,onPaste:g,onCopy:g,onChange:o=>{const r=o.target.value,t=parseInt(r,10);if(t<0){m.fire({icon:"error",title:"Error",text:"No se permiten números negativos en años de experiencia."}),_({...s,Años_experiencia:""});return}if(r.length>2){m.fire({icon:"error",title:"Error",text:"Solo se permiten hasta 2 dígitos para los años de experiencia."}),_({...s,Años_experiencia:""});return}t<=40?_({...s,Años_experiencia:r}):(m.fire({icon:"error",title:"Error",text:"Los años de experiencia deben estar entre 0 y 40."}),_({...s,Años_experiencia:""}))}})]})]})}),e.jsxs(q,{children:[e.jsx(f,{color:"secondary",onClick:()=>U($,L),children:"Cancelar"}),e.jsxs(f,{style:{backgroundColor:"#4B6251",color:"white"},onClick:Re,children:[e.jsx(E,{icon:lo,style:{marginRight:"5px"}}),"Guardar"]})]})]}),e.jsxs(B,{visible:fe,backdrop:"static",children:[e.jsxs(G,{closeButton:!1,children:[e.jsx(J,{children:"Actualizar Profesor"}),e.jsx(f,{className:"btn-close","aria-label":"Close",onClick:()=>U(O,L)})]}),e.jsx(V,{children:e.jsxs(ue,{children:[e.jsxs(u,{className:"mb-3",children:[e.jsx(C,{children:"Grado Académico"}),e.jsxs(Y,{value:h.Cod_grado_academico,onChange:o=>b({...h,Cod_grado_academico:o.target.value}),children:[e.jsx("option",{value:"",children:"Seleccione grado académico"}),P.map(o=>e.jsx("option",{value:o.Cod_grado_academico,children:o.Descripcion},o.Cod_grado_academico))]})]}),e.jsxs(u,{className:"mb-3",children:[e.jsx(C,{children:"Tipo de Contrato"}),e.jsxs(Y,{value:h.Cod_tipo_contrato,onChange:o=>b({...h,Cod_tipo_contrato:o.target.value}),children:[e.jsx("option",{value:"",children:"Seleccione tipo de contrato"}),N.map(o=>e.jsx("option",{value:o.Cod_tipo_contrato,children:o.Descripcion},o.Cod_tipo_contrato))]})]}),e.jsxs(u,{className:"mb-3",children:[e.jsx(C,{children:"Hora Entrada"}),e.jsx(y,{type:"time",value:h.Hora_entrada,onChange:o=>b({...h,Hora_entrada:o.target.value})})]}),e.jsxs(u,{className:"mb-3",children:[e.jsx(C,{children:"Hora Salida"}),e.jsx(y,{type:"time",value:h.Hora_salida,onChange:o=>b({...h,Hora_salida:o.target.value})})]}),e.jsxs(u,{className:"mb-3",children:[e.jsx(C,{children:"Fecha Ingreso"}),e.jsx(y,{type:"date",value:h.Fecha_ingreso,onChange:o=>b({...h,Fecha_ingreso:o.target.value})})]}),e.jsxs(u,{className:"mb-3",children:[e.jsx(C,{children:"Fecha Fin Contrato"}),e.jsx(y,{type:"date",value:h.Fecha_fin_contrato,onChange:o=>b({...h,Fecha_fin_contrato:o.target.value})})]}),e.jsxs(u,{className:"mb-3",children:[e.jsx(C,{children:"Años de Experiencia"}),e.jsx(y,{type:"number",value:h.Años_experiencia,onPaste:o=>o.preventDefault(),onCopy:o=>o.preventDefault(),onKeyPress:o=>{const r=o.target.value;if(o.key==="-"){o.preventDefault(),m.fire({icon:"warning",title:"Advertencia",text:"No se permiten números negativos en años de experiencia."});return}if(r.length>1&&!isNaN(r)){m.fire({icon:"error",title:"Error",text:"Solo se permiten hasta 2 dígitos para los años de experiencia."}),b({...h,Años_experiencia:""});return}},onChange:o=>{const r=o.target.value,t=parseInt(r,10);if(t<0){m.fire({icon:"error",title:"Error",text:"No se permiten números negativos en años de experiencia."}),b({...h,Años_experiencia:""});return}if(t>50){m.fire({icon:"error",title:"Error",text:"Los años de experiencia deben estar entre 0 y 50."}),b({...h,Años_experiencia:""});return}b({...h,Años_experiencia:r})}})]})]})}),e.jsxs(q,{children:[e.jsx(f,{color:"secondary",onClick:()=>U(O,Te),children:"Cancelar"}),e.jsxs(f,{style:{backgroundColor:"#F9B64E",color:"white"},onClick:Ie,children:[e.jsx(E,{icon:xe,style:{marginRight:"5px"}}),"Actualizar"]})]})]}),e.jsxs(B,{visible:_e,onClose:()=>K(!1),children:[e.jsx(G,{children:e.jsx(J,{children:"Eliminar Profesor"})}),e.jsxs(V,{children:["¿Estás seguro de que deseas eliminar al profesor? ",e.jsx("strong",{children:te(Q.cod_persona)})]}),e.jsxs(q,{children:[e.jsx(f,{color:"secondary",onClick:()=>K(!1),children:"Cancelar"}),e.jsxs(f,{style:{backgroundColor:"#E57368",color:"white"},onClick:ze,children:[e.jsx(E,{icon:po,style:{marginRight:"5px"}}),"  Eliminar"]})]})]})]})};export{Vo as default};
