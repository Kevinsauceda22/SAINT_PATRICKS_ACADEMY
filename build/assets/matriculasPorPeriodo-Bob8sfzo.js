import{o as B,r,j as o,C as Y,i as x}from"./index-SVRFFNc9.js";import{E as H}from"./jspdf.plugin.autotable-gke1D7B3.js";import{u as b,w as U}from"./xlsx-lwdk4T0U.js";import{l as O}from"./logo_saint_patrick-xw7Wl8f3.js";import{C as X}from"./CContainer-BdNP0s3v.js";import{C as K,a as V}from"./CRow-Bf67u6lu.js";import{a as W}from"./CButton-D9GPTbB6.js";import{C as q,a as J}from"./CCardBody-BwCgYaTs.js";import{C as Q}from"./CCardTitle-BpfOpSSz.js";import{C as Z,a as ee,b as oe,c as _}from"./CDropdownToggle-DlfIUTmX.js";import{C as te,a as ae,b as A,c as S,d as se,e as C}from"./CTable-98qqrSRH.js";import"./CConditionalPortal-DwBsYzTA.js";const be=()=>{const $=B(),[f,D]=r.useState([]),[h,w]=r.useState([]),[i,g]=r.useState([]),[d,E]=r.useState(""),[m,j]=r.useState(""),[c,N]=r.useState(null),[R,y]=r.useState(!1),[T,v]=r.useState([]),z=async()=>{try{const e=await x.get("http://74.50.68.87:4000/api/matricula/opciones"),t=e.data.periodos_matricula||[],a=[...new Set(t.map(n=>n.Anio_academico))].sort((n,p)=>p-n);v(a),N(a[0]),D(e.data.grados||[])}catch(e){console.error("Error al obtener los grados y los años académicos:",e)}},P=async e=>{if(e){y(!0),w([]),j("");try{const t=await x.get(`http://74.50.68.87:4000/api/matricula/detalles/${e}`);w(t.data.data||[])}catch(t){console.error("Error al obtener las secciones por grado:",t)}finally{y(!1)}}},F=async(e,t)=>{if(!e||!t){console.warn("Parámetros faltantes: cod_seccion o anio_academico");return}try{console.log(`Fetching alumnos for sección: ${e}, año académico: ${t}`);const a=await x.get(`http://74.50.68.87:4000/api/matricula/alumnos/seccion/${e}`,{params:{anio_academico:t}});console.log("Respuesta de la API:",a.data),g(a.data.data||[])}catch(a){console.error("Error al obtener alumnos matriculados:",a),g([])}},k=()=>{const e=new H;if(!Array.isArray(i)||i.length===0){console.warn("No hay datos de alumnos para mostrar en el PDF.");return}const t=new Image;t.src=O;const a=f.find(l=>String(l.Cod_grado)===String(d)),n=a?a.Nombre_grado:"N/A",p=h.find(l=>String(l.Cod_secciones)===String(m)),G=p?p.Nombre_seccion:"N/A";t.onload=()=>{e.addImage(t,"PNG",10,10,30,30),e.setFontSize(18),e.setTextColor(0,102,51),e.text("SAINT PATRICK'S ACADEMY",e.internal.pageSize.width/2,20,{align:"center"}),e.setFontSize(14),e.text("Reporte de Alumnos Matriculados",e.internal.pageSize.width/2,30,{align:"center"}),e.setFontSize(10),e.setTextColor(100),e.text("Casa Club del periodista, Colonia del Periodista",e.internal.pageSize.width/2,40,{align:"center"}),e.text("Teléfono: (504) 2234-8871",e.internal.pageSize.width/2,45,{align:"center"}),e.text("Correo: info@saintpatrickacademy.edu",e.internal.pageSize.width/2,50,{align:"center"}),e.setLineWidth(.5),e.setDrawColor(0,102,51),e.line(10,55,e.internal.pageSize.width-10,55),e.setFontSize(12),e.setTextColor(0),e.text(`Grado: ${n}`,10,65),e.text(`Sección: ${G}`,10,70),e.text(`Año Académico: ${c||"N/A"}`,10,75),e.autoTable({startY:80,head:[["#","Nombre del Alumno","Fecha de Nacimiento"]],body:i.map((s,u)=>[u+1,`${s.Nombre} ${s.Segundo_nombre||""} ${s.Primer_apellido} ${s.Segundo_apellido}`.trim(),s.fecha_nacimiento?new Date(s.fecha_nacimiento).toLocaleDateString("es-ES"):"No disponible"]),headStyles:{fillColor:[0,102,51],textColor:[255,255,255],fontSize:10},styles:{fontSize:10,cellPadding:3},alternateRowStyles:{fillColor:[240,248,255]}});const l=e.internal.getNumberOfPages();for(let s=1;s<=l;s++){e.setPage(s);const u=new Date().toLocaleString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"});e.setFontSize(10),e.setTextColor(100),e.text(`Fecha y Hora de Generación: ${u}`,10,e.internal.pageSize.height-10),e.text(`Página ${s} de ${l}`,e.internal.pageSize.width-30,e.internal.pageSize.height-10,{align:"right"})}const M=e.output("blob"),I=URL.createObjectURL(M);window.open(I,"_blank")},t.onerror=()=>{console.warn("No se pudo cargar el logo. El PDF se generará sin el logo.")}},L=()=>{const e=b.json_to_sheet(i.map((a,n)=>({"#":n+1,"Nombre del Alumno":`${a.Nombre} ${a.Segundo_nombre||""} ${a.Primer_apellido} ${a.Segundo_apellido}`.trim(),"Fecha de Nacimiento":a.fecha_nacimiento?new Date(a.fecha_nacimiento).toLocaleDateString("es-ES"):"No disponible"}))),t=b.book_new();b.book_append_sheet(t,e,"Alumnos"),U(t,"Reporte_Alumnos_Matriculados.xlsx")};return r.useEffect(()=>{z()},[]),r.useEffect(()=>{d&&P(d)},[d]),r.useEffect(()=>{m&&c?F(m,c):g([])},[m,c]),o.jsx(X,{children:o.jsx(K,{className:"mb-4",children:o.jsxs(V,{xs:12,children:[o.jsxs(W,{style:{backgroundColor:"#6c757d",color:"white",border:"none",borderRadius:"5px",padding:"10px 20px",fontSize:"16px"},className:"mb-4",onClick:()=>$("/matricula"),children:[o.jsx("i",{className:"bi bi-arrow-left"})," Volver a Matrículas"]}),o.jsx(q,{className:"shadow-sm",children:o.jsxs(J,{children:[o.jsxs(Q,{className:"text-center mb-4",children:[o.jsx("h4",{className:"fw-bold",children:"Alumnos Matriculados por Sección"}),o.jsxs("p",{className:"text-muted",children:["Año Académico: ",c||"Cargando..."]})]}),o.jsxs("div",{className:"d-flex justify-content-around mb-4",children:[o.jsxs("select",{className:"form-select form-select-lg border-primary shadow-sm",style:{width:"250px",borderRadius:"5px"},value:d,onChange:e=>E(e.target.value),children:[o.jsx("option",{value:"",children:"Selecciona un grado"}),f.map(e=>o.jsx("option",{value:e.Cod_grado,children:e.Nombre_grado},e.Cod_grado))]}),o.jsxs("select",{className:"form-select form-select-lg border-success shadow-sm",style:{width:"250px",borderRadius:"5px"},value:m,onChange:e=>j(e.target.value),disabled:!h.length,children:[o.jsx("option",{value:"",children:"Selecciona una sección"}),h.map(e=>o.jsx("option",{value:e.Cod_secciones,children:e.Nombre_seccion},e.Cod_secciones))]}),o.jsx("select",{className:"form-select form-select-lg border-secondary shadow-sm",style:{width:"200px",borderRadius:"5px"},value:c,onChange:e=>N(e.target.value),children:T.map(e=>o.jsx("option",{value:e,children:e},e))})]}),o.jsx("div",{className:"d-flex justify-content-end",children:o.jsxs(Z,{children:[o.jsx(ee,{color:"success",className:"shadow-sm",children:"Reporte"}),o.jsxs(oe,{children:[o.jsx(_,{onClick:k,children:"Exportar a PDF"}),o.jsx(_,{onClick:L,children:"Exportar a Excel"})]})]})}),R?o.jsx(Y,{color:"primary",className:"d-block mx-auto mt-4"}):i.length>0?o.jsxs(te,{striped:!0,hover:!0,responsive:!0,className:"mt-4",style:{backgroundColor:"#f8f9fa",borderRadius:"10px"},children:[o.jsx(ae,{className:"bg-success text-white",children:o.jsxs(A,{children:[o.jsx(S,{children:"#"}),o.jsx(S,{children:"Nombre del Alumno"}),o.jsx(S,{children:"Fecha de Nacimiento"})]})}),o.jsx(se,{children:i.map((e,t)=>o.jsxs(A,{style:{borderBottom:"1px solid #dee2e6"},children:[o.jsx(C,{children:t+1}),o.jsx(C,{children:`${e.Nombre||""} ${e.Segundo_nombre||""} ${e.Primer_apellido||""} ${e.Segundo_apellido||""}`.trim()}),o.jsx(C,{children:e.fecha_nacimiento?new Date(e.fecha_nacimiento).toLocaleDateString("es-ES"):"No disponible"})]},t))})]}):o.jsx("p",{className:"text-center mt-4",children:"No hay alumnos matriculados para la sección seleccionada."})]})})]})})})};export{be as default};
