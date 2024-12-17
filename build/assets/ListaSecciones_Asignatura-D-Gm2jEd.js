import{r as i,o as Ue,u as Te,j as o,i as Ie}from"./index-SVRFFNc9.js";import{C as L}from"./index.esm-DWwMdKxH.js";import{S as l}from"./sweetalert2.esm.all-D3pEHXw3.js";import{E as de}from"./jspdf.plugin.autotable-gke1D7B3.js";import{l as pe}from"./logo_saint_patrick-xw7Wl8f3.js";import He from"./AccessDenied-yaDW3Jao.js";import{u as Fe}from"./usePermission-BCWksQX7.js";import{C as ze}from"./CContainer-BdNP0s3v.js";import{C as Q,a as w}from"./CRow-Bf67u6lu.js";import{a as f}from"./CButton-D9GPTbB6.js";import{c as Me}from"./cil-arrow-left-D66Kb3Zq.js";import{C as Re,a as $e,b as Le,c as Oe}from"./CDropdownToggle-DlfIUTmX.js";import{c as Be}from"./cil-description-MUzg6O3n.js";import{C as x}from"./CInputGroup-D-McUFva.js";import{C as y}from"./CInputGroupText-Cfu0fzaY.js";import{c as Ge}from"./cil-search-CDkY_4k-.js";import{C as H}from"./CFormInput-B_gylY64.js";import{C as ge}from"./CFormSelect-CzT7g5tb.js";import{C as We,a as Je,b as X,c as S,d as Ve,e as h}from"./CTable-98qqrSRH.js";import{c as qe}from"./cil-pen-53d2I-C-.js";import{c as Ye}from"./cil-arrow-circle-bottom-eSdqpImC.js";import{C as Ke}from"./CPagination-UopCEeNZ.js";import{C as Ze,a as Qe,b as Xe,c as eo}from"./CModalHeader-Bhtr3bZe.js";import{C as oo}from"./CModalTitle-M2mBvD_5.js";import{C as ro}from"./CFormCheck-Dbe1knc1.js";import"./CConditionalPortal-DwBsYzTA.js";import"./CFormControlWrapper-OEJgTi6e.js";import"./CFormControlValidation-CtDkyDfm.js";import"./CFormLabel-szm2Dda9.js";import"./CBackdrop-BbuVwMMD.js";const ao=D=>{try{const p=D.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"),C=decodeURIComponent(atob(p).split("").map(F=>`%${`00${F.charCodeAt(0).toString(16)}`.slice(-2)}`).join(""));return JSON.parse(C)}catch(v){return console.error("Error al decodificar el token JWT:",v),null}},so=async(D,v="")=>{try{const p=localStorage.getItem("token"),C=ao(p);if(!C){l.fire("Error","Token inválido o expirado. Por favor, inicie sesión nuevamente.","error");return}const F=C.cod_usuario,N=C.nombre_usuario;if(!F||!N){l.fire("Error","El token no contiene información válida del usuario.","error");return}const z=`El usuario: ${N} realizó la acción: ${D}. ${v}`;await Ie.post("http://localhost:4000/api/bitacora/registro",{cod_usuario:F,cod_objeto:93,accion:D,descripcion:z},{headers:{Authorization:`Bearer ${p}`}})}catch(p){console.error("Error al registrar en bitácora:",p.message),l.fire("Error","Hubo un problema al registrar en la bitácora.","error")}},Mo=()=>{const{canSelect:D,canUpdate:v}=Fe("ListaSecciones_Asignatura"),[p,C]=i.useState([]),[F,N]=i.useState([]),[z,ue]=i.useState([]),[O,ee]=i.useState([]),[q,oe]=i.useState(""),[me,Y]=i.useState(!1),[t,M]=i.useState({}),[re,K]=i.useState(!0),[P,fe]=i.useState(1),[k,xe]=i.useState(10),[B,to]=i.useState(""),ae=Ue(),he=Te(),{seccionSeleccionada:U,periodoSeleccionado:g,gradoSeleccionado:G,profesores:R}=he.state||{},[no,Ce]=i.useState([]);i.useEffect(()=>{(!U||!g)&&(l.fire("Error","Faltan datos para gestionar las asignaturas.","error"),ae("/lista-secciones"))},[U,g]),i.useEffect(()=>{O.length>0&&G&&U&&se()},[O,G,U]),i.useEffect(()=>{be(),ye(),Se()},[]),i.useEffect(()=>{B&&(console.log("Llamando a fetchSeccionesPorGrado con:",B),_e(B))},[B]),i.useEffect(()=>{R&&R.length>0&&Ce(R)},[R]),i.useEffect(()=>{g&&je()},[g]);const se=async()=>{try{const e=await fetch(`http://localhost:4000/api/secciones_asignaturas/asignaturas/${U}`),r=await e.json();console.log("Datos crudos recibidos de la API:",r),e.ok?(C(r.map(a=>({...a,Nombre_profesor:a.profesor?a.profesor.Nombre_completo:"Sin profesor asignado"}))),console.log("Datos con Nombre_profesor asignado:",r)):(C([]),l.fire("Atención","No se encontraron asignaturas para esta sección.","info"))}catch(e){console.error("Error capturado en este bloque:",e),console.error("Error al cargar las asignaturas:",e),l.fire("Error","Hubo un problema al cargar las asignaturas.","error")}},be=async(e,r)=>{try{const a=await fetch(`http://localhost:4000/api/secciones_asignaturas/secciones/${e}/${r}`);if(!a.ok)throw new Error("No se encontraron secciones para este grado y periodo.");const s=await a.json();N(s)}catch(a){console.error("Error capturado en este bloque:",a),console.error("Error al cargar secciones:",a),N([])}},_e=async e=>{if(!e||!g){console.error("Cod_grado o periodoSeleccionado están indefinidos.");return}console.log("Cod_grado enviado al backend:",e),console.log("Cod_periodo_matricula enviado al backend:",g);try{const r=await fetch(`http://localhost:4000/api/secciones_asignaturas/secciones/${e}/${g}`);if(!r.ok)throw new Error("No se encontraron secciones para este grado y periodo.");const a=await r.json();N(a)}catch(r){console.error("Error capturado en este bloque:",r),console.error("Error al obtener secciones:",r),N([])}},je=async()=>{try{const a=(await(await fetch("http://localhost:4000/api/gestion_academica/obtener_periodo")).json()).find(s=>s.Cod_periodo_matricula===g);a?K(a.Estado==="activo"):(console.warn("Período no encontrado."),K(!1))}catch(e){console.error("Error capturado en este bloque:",e),console.error("Error al obtener el estado del período:",e),K(!1)}},ye=async()=>{try{const r=await(await fetch("http://localhost:4000/api/secciones_asignaturas/dias")).json();ue(r)}catch(e){console.error("Error capturado en este bloque:",e),console.error("Error al cargar días:",e)}},Se=async()=>{try{const r=await(await fetch("http://localhost:4000/api/secciones_asignaturas/grados_asignaturas")).json();ee(r),console.log("Datos cargados en grados_asignaturas:",r)}catch(e){console.error("Error capturado en este bloque:",e),console.error("Error al cargar los grados y asignaturas:",e)}},Ne=()=>{ae("/lista-secciones",{state:{periodoSeleccionado:g}})},Ae=e=>{const r=R.find(a=>a.Cod_profesor===e);return r?r.Nombre_completo:"Profesor no disponible"},Ee=async e=>{console.log("Datos de seccionAsignatura recibidos:",e);try{const r=e.Dias_nombres?e.Dias_nombres.split(",").map(c=>{const d=z.find(_=>_.prefijo_dia.toUpperCase()===c.trim().toUpperCase());return d?d.Cod_dias:null}).filter(Boolean):[];M({p_Cod_seccion_asignatura:e.Cod_seccion_asignatura||"",p_Cod_grados_asignaturas:e.Cod_grados_asignaturas||"",p_Cod_secciones:e.Cod_secciones||"",p_Cod_dias:r,p_Hora_inicio:e.Hora_inicio||"",p_Hora_fin:e.Hora_fin||"",p_Cod_grado:e.Nombre_grado||"",p_Nombre_seccion:e.Nombre_seccion||""});const a=await fetch(`http://localhost:4000/api/secciones_asignaturas/asignaturasgrados/${U}`),s=await a.json();a.ok?ee(s):(console.error("Error al cargar las asignaturas:",s.mensaje),l.fire("Error","No se pudieron cargar las asignaturas.","error")),Y(!0)}catch(r){console.error("Error al abrir el modal de actualización:",r),l.fire("Error","Hubo un problema al abrir el modal de actualización.","error")}},we=async()=>{if(!t||!t.p_Cod_seccion_asignatura||!t.p_Cod_secciones||!t.p_Hora_inicio||!t.p_Hora_fin||!t.p_Cod_grados_asignaturas||!t.p_Cod_dias){l.fire("Error","Todos los campos son requeridos y deben estar completos.","error");return}try{const e=Array.isArray(t.p_Cod_dias)?t.p_Cod_dias:t.p_Cod_dias.split(",").map(n=>n.trim()),r=z.filter(n=>e.includes(n.Cod_dias)).map(n=>n.prefijo_dia.toUpperCase()).join(", "),a={...t,p_Cod_dias:e.join(","),p_Dias_nombres:r},s=O.find(n=>n.Cod_grados_asignaturas===t.p_Cod_grados_asignaturas),c=s?s.Nombre_asignatura:"Asignatura desconocida",d=t.p_Nombre_seccion||"Sección desconocida",_=t.p_Cod_grado||"Grado desconocido",A=await fetch("http://localhost:4000/api/secciones_asignaturas/actualizar_seccion_asig",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)});if(A.ok)await so("UPDATE",`Actualización de la asignatura "${c}" en la sección "${d}" del grado "${_}".`),l.fire("Éxito","Sección asignatura actualizada correctamente.","success"),Y(!1),se();else{const n=await A.json();l.fire("Error",n.mensaje||"Error al actualizar la sección asignatura.","error")}}catch(e){console.error("Error al actualizar la sección asignatura:",e),l.fire("Error","Error en el servidor. Por favor, inténtalo más tarde.","error")}},te=()=>{l.fire({title:"¿Estás seguro?",text:"Tienes cambios sin guardar. ¿Deseas cerrar el modal?",icon:"warning",showCancelButton:!0,confirmButtonText:"Cerrar",cancelButtonText:"Cancelar"}).then(e=>{e.isConfirmed&&Y(!1)})},De=()=>{var _,A;const e=new de;if(!b||b.length===0){alert("No hay datos para exportar.");return}const r=new Image;r.src=pe;const a=G||"Grado no disponible",s=((_=b[0])==null?void 0:_.Nombre_seccion)||"Sección no disponible",c=(A=b[0])==null?void 0:A.Cod_profesor,d=Ae(c);console.log("Profesor:",d),r.onload=()=>{const n=e.internal.pageSize.width;e.addImage(r,"PNG",10,10,45,45),e.setFontSize(18),e.setTextColor(0,102,51),e.text("SAINT PATRICK'S ACADEMY",n/2,24,{align:"center"}),e.setFontSize(10),e.setTextColor(100),e.text("Casa Club del periodista, Colonia del Periodista",n/2,32,{align:"center"}),e.text("Teléfono: (504) 2234-8871",n/2,37,{align:"center"}),e.text("Correo: info@saintpatrickacademy.edu",n/2,42,{align:"center"}),e.setFontSize(14),e.setTextColor(0,102,51),e.text("Horario - Año Académico 2025",n/2,50,{align:"center"}),e.setLineWidth(.5),e.setDrawColor(0,102,51),e.line(10,55,n-10,55),e.setFontSize(10),e.setTextColor(50),e.text("INFORMACIÓN GENERAL:",10,65),e.setFontSize(9),e.text(`GRADO: ${a}`,10,72),e.text(`SECCIÓN: ${s}`,10,78),e.text(`MAESTRO GUÍA: ${d}`,10,84),e.setLineWidth(.5),e.setDrawColor(0,102,51),e.line(10,88,n-10,88);const Z=["#","Asignatura","Días","Hora Inicio","Hora Fin"],W={LU:1,MAR:2,MIE:3,JUE:4,VIE:5,SAB:6,DOM:7},J=b.map((m,T)=>{var I;return[{content:(T+1).toString(),styles:{halign:"center"}},((I=m.Nombre_asignatura)==null?void 0:I.toUpperCase())||"SIN ASIGNATURA",m.Dias_nombres?m.Dias_nombres.split(",").map(j=>j.trim().toUpperCase()).sort((j,V)=>(W[j]||99)-(W[V]||99)).join(", "):"SIN DÍAS",{content:m.Hora_inicio||"00:00",styles:{halign:"center"}},{content:m.Hora_fin||"00:00",styles:{halign:"center"}}]});e.autoTable({startY:95,head:[Z],body:J,headStyles:{fillColor:[0,102,51],textColor:[255,255,255],fontSize:10,halign:"center"},styles:{fontSize:10,cellPadding:3},alternateRowStyles:{fillColor:[240,248,255]},didDrawPage:m=>{const T=e.internal.getNumberOfPages(),I=e.internal.getCurrentPageInfo().pageNumber,j=e.internal.pageSize.height-10;e.setFontSize(10),e.setTextColor(0,102,51),e.text(`Página ${I} de ${T}`,n-10,j,{align:"right"});const V=new Date,Pe=V.toLocaleDateString("es-HN",{year:"numeric",month:"long",day:"numeric"}),ke=V.toLocaleTimeString("es-HN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});e.text(`Fecha de generación: ${Pe} Hora: ${ke}`,10,j)}});const u=e.output("blob"),$=URL.createObjectURL(u),E=window.open($,"_blank");E&&(E.document.title="Reporte de Secciones y Horarios")},r.onerror=()=>{alert("No se pudo cargar el logo.")}},ve=async e=>{try{const r=await fetch(`http://localhost:4000/api/secciones_asignaturas/detalle/${e}`);if(!r.ok)throw new Error(`Error al obtener datos de la sección asignatura: ${r.status}`);const a=await r.json(),s=new de,c=new Image;c.src=pe,c.onload=()=>{const d=s.internal.pageSize.width;s.addImage(c,"PNG",10,10,45,45),s.setFontSize(18),s.setTextColor(0,102,51),s.text("SAINT PATRICK'S ACADEMY",d/2,24,{align:"center"}),s.setFontSize(10),s.setTextColor(100),s.text("Casa Club del periodista, Colonia del Periodista",d/2,32,{align:"center"}),s.text("Teléfono: (504) 2234-8871",d/2,37,{align:"center"}),s.text("Correo: info@saintpatrickacademy.edu",d/2,42,{align:"center"}),s.setFontSize(14),s.setTextColor(0,102,51),s.text("Detalles de la Asignatura",d/2,50,{align:"center"}),s.setLineWidth(.5),s.setDrawColor(0,102,51),s.line(10,55,d-10,55);const _=[{key:"Nombre de la Sección",value:a.Nombre_seccion||"No disponible"},{key:"Hora de Inicio",value:a.Hora_inicio||"No disponible"},{key:"Hora de Fin",value:a.Hora_fin||"No disponible"},{key:"Nombre del Grado",value:a.Nombre_grado||"No disponible"},{key:"Nombre de la Asignatura",value:a.Nombre_asignatura||"No disponible"},{key:"Días",value:Array.isArray(a.Dias_nombres)?a.Dias_nombres.sort((u,$)=>{const E=["LU","MAR","MIE","JUE","VIE","SAB","DOM"];return E.indexOf(u.toUpperCase())-E.indexOf($.toUpperCase())}).map(u=>u.toUpperCase()).join(", "):a.Dias_nombres?a.Dias_nombres.toUpperCase():"Sin días asignados"}],A=["Detalle","Información"],n=_.map(u=>[u.key,u.value]);s.autoTable({startY:70,head:[A],body:n,headStyles:{fillColor:[0,102,51],textColor:[255,255,255],fontSize:10,halign:"center"},styles:{fontSize:10,cellPadding:3},alternateRowStyles:{fillColor:[240,248,255]},didDrawPage:u=>{const $=s.internal.getNumberOfPages(),E=s.internal.getCurrentPageInfo().pageNumber,m=s.internal.pageSize.height-10;s.setFontSize(10),s.setTextColor(0,102,51),s.text(`Página ${E} de ${$}`,d-10,m,{align:"right"});const T=new Date,I=T.toLocaleDateString("es-HN",{year:"numeric",month:"long",day:"numeric"}),j=T.toLocaleTimeString("es-HN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});s.text(`Fecha de generación: ${I} Hora: ${j}`,10,m)}});const Z=s.output("blob"),W=URL.createObjectURL(Z),J=window.open(W,"_blank");J&&(J.document.title=`Detalles Sección Asignatura #${e}`)},c.onerror=()=>{l.fire("Error","No se pudo cargar el logo.","error")}}catch(r){console.error("Error capturado en este bloque:",r),console.error("Error al generar el PDF:",r),l.fire("Error","No se pudo generar el PDF.","error")}},ne=e=>{e>0&&e<=Math.ceil(p.length/k)&&fe(e)},b=p.filter(e=>{const r=s=>s.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");return q?r(e.Nombre_asignatura).includes(r(q)):!0}),ie=P*k,ce=ie-k,le=b.slice(ce,ie);return D?o.jsxs(ze,{children:[o.jsxs("div",{className:"container mt-3",children:[" ",o.jsxs("div",{className:"container mt-3",children:[" ",o.jsx(Q,{className:"align-items-center mb-3",children:o.jsx(w,{xs:"12",className:"text-center",children:o.jsx("h2",{className:"fw-bold",children:"Gestión de Asignaturas y Horarios"})})}),o.jsxs(Q,{className:"align-items-center mb-3",children:[o.jsx(w,{xs:"12",md:"4",className:"text-start mb-2 mb-md-0",children:o.jsxs(f,{className:"d-flex align-items-center gap-1 rounded shadow",onMouseEnter:e=>e.currentTarget.style.backgroundColor="#4B4B4B",onMouseLeave:e=>e.currentTarget.style.backgroundColor="#656565",style:{backgroundColor:"#656565",color:"#FFFFFF",padding:"10px 16px",fontSize:"0.9rem",transition:"background-color 0.2s ease, box-shadow 0.3s ease",boxShadow:"0 4px 8px rgba(0, 0, 0, 0.2)",whiteSpace:"nowrap"},onClick:Ne,children:[o.jsx(L,{icon:Me})," Volver a Secciones"]})}),o.jsx(w,{xs:"12",md:"4",className:"text-center mb-2 mb-md-0"}),o.jsx(w,{xs:"12",md:"4",className:"text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center gap-2",children:o.jsxs(Re,{children:[o.jsxs($e,{style:{backgroundColor:"#6C8E58",color:"white",padding:"10px 16px",fontSize:"0.9rem"},className:"d-flex align-items-center rounded shadow",children:[o.jsx(L,{icon:Be})," Reporte"]}),o.jsx(Le,{children:o.jsx(Oe,{onClick:()=>De(),style:{color:"#6C8E58",fontWeight:"bold"},children:"Ver Reporte en PDF"})})]})})]})]}),o.jsx("div",{className:"filter-container mb-4",children:o.jsxs(Q,{className:"align-items-center",children:[o.jsx(w,{xs:"12",md:"2",className:"text-start",children:o.jsx(f,{color:"light",onClick:()=>{oe("")},style:{padding:"6px 12px",fontSize:"0.9rem",backgroundColor:"#E0E0E0",color:"#000",border:"1px solid #CCC"},children:"Limpiar"})}),o.jsx(w,{xs:"12",md:"6",className:"d-flex align-items-center gap-2",children:o.jsxs(x,{children:[o.jsx(y,{children:o.jsx(L,{icon:Ge})}),o.jsx(H,{placeholder:"Buscar Asignatura...",value:q,onChange:e=>{let r=e.target.value;r=r.toUpperCase(),r=r.replace(/[^A-Z0-9 ]/g,""),r=r.normalize("NFD").replace(/[\u0300-\u036f]/g,""),r=r.replace(/(.)\1{3,}/g,"$1$1$1"),r=r.replace(/\s{2,}/g," "),oe(r)},style:{padding:"6px",fontSize:"0.9rem",minWidth:"200px"}})]})}),o.jsx(w,{xs:"12",md:"4",className:"text-md-end",children:o.jsxs(x,{style:{width:"auto",display:"inline-flex",alignItems:"center"},children:[o.jsx("span",{children:"Mostrar "}),o.jsxs(ge,{value:k,onChange:e=>xe(parseInt(e.target.value)),style:{padding:"6px",fontSize:"0.9rem",width:"70px"},children:[o.jsx("option",{value:"5",children:"5"}),o.jsx("option",{value:"10",children:"10"}),o.jsx("option",{value:"20",children:"20"})]}),o.jsx("span",{children:" registros"})]})})]})}),o.jsx("div",{className:"table-container",style:{maxHeight:"400px",overflowY:"scroll",marginBottom:"20px"},children:o.jsxs(We,{striped:!0,bordered:!0,hover:!0,children:[o.jsx(Je,{style:{position:"sticky",top:0,zIndex:1,backgroundColor:"#fff",textAlign:"center"},children:o.jsxs(X,{children:[o.jsx(S,{style:{textAlign:"center"},children:"#"}),o.jsx(S,{style:{textAlign:"center"},children:"Grado"}),o.jsx(S,{style:{textAlign:"center"},children:"Sección"}),o.jsx(S,{style:{textAlign:"center"},children:"Asignatura"}),o.jsx(S,{style:{textAlign:"center"},children:"Días"}),o.jsx(S,{style:{textAlign:"center"},children:"Hora inicial"}),o.jsx(S,{style:{textAlign:"center"},children:"Hora final"}),o.jsx(S,{style:{textAlign:"center"},children:"Acciones"})]})}),o.jsxs(Ve,{children:[le.map((e,r)=>o.jsxs(X,{children:[o.jsx(h,{style:{textAlign:"center"},children:ce+r+1}),o.jsx(h,{style:{textAlign:"center"},children:G||"Grado no disponible"}),o.jsx(h,{style:{textAlign:"center"},children:e.Nombre_seccion||"Sección no disponible"}),o.jsx(h,{children:e.Nombre_asignatura||"Asignatura no disponible"}),o.jsx(h,{children:Array.isArray(e.Dias_nombres)?e.Dias_nombres.sort((a,s)=>{const c=["LU","MAR","MIE","JUE","VIE","SAB","DOM"];return c.indexOf(a.toUpperCase())-c.indexOf(s.toUpperCase())}).map(a=>a.toUpperCase()).join(", "):typeof e.Dias_nombres=="string"?e.Dias_nombres.split(",").map(a=>a.trim().toUpperCase()).sort((a,s)=>{const c=["LU","MAR","MIE","JUE","VIE","SAB","DOM"];return c.indexOf(a)-c.indexOf(s)}).join(", "):"NO ESPECIFICADOS"}),o.jsx(h,{style:{textAlign:"center"},children:e.Hora_inicio||"No especificada"}),o.jsx(h,{style:{textAlign:"center"},children:e.Hora_fin||"No especificada"}),o.jsx(h,{children:o.jsxs("div",{className:"d-flex justify-content-center",children:[v&&o.jsx(f,{color:"info",onClick:()=>{re?Ee(e):l.fire("Período Inactivo","No puedes actualizar asignaturas en un período académico inactivo.","warning")},className:"me-2",disabled:!re,children:o.jsx(L,{icon:qe})}),o.jsxs(f,{color:"warning",onClick:()=>ve(e.Cod_seccion_asignatura),className:"d-flex align-items-center",children:[o.jsx(L,{icon:Ye,className:"me-1"})," PDF"]})]})})]},e.Cod_seccion_asignatura)),le.length===0&&o.jsx(X,{children:o.jsx(h,{colSpan:"8",className:"text-center",children:"No hay asignaturas ni horarios asociados a esta sección."})})]})]})})]}),o.jsxs("div",{className:"pagination-container",style:{display:"flex",justifyContent:"center",alignItems:"center"},children:[o.jsxs(Ke,{"aria-label":"Page navigation",children:[o.jsx(f,{style:{backgroundColor:"#6f8173",color:"#D9EAD3"},disabled:P===1,onClick:()=>ne(P-1),children:"Anterior"}),o.jsx(f,{style:{marginLeft:"10px",backgroundColor:"#6f8173",color:"#D9EAD3"},disabled:P===Math.ceil(b.length/k),onClick:()=>ne(P+1),children:"Siguiente"})]}),o.jsxs("span",{style:{marginLeft:"10px"},children:["Página ",P," de ",Math.ceil(b.length/k)]})]}),o.jsxs(Ze,{visible:me,backdrop:"static",children:[o.jsxs(Qe,{closeButton:!1,children:[o.jsx(oo,{children:"Actualizar Sección Asignatura"}),o.jsx(f,{className:"btn-close","aria-label":"Close",onClick:()=>{te()}})]}),o.jsxs(Xe,{children:[o.jsxs(x,{className:"mb-3",children:[o.jsx(y,{children:"Código"}),o.jsx(H,{value:t.p_Cod_seccion_asignatura||"",disabled:!0})]}),o.jsxs(x,{className:"mb-3",children:[o.jsx(y,{children:"Grado"}),o.jsx(H,{value:t.p_Cod_grado||"",disabled:!0})]}),o.jsxs(x,{className:"mb-3",children:[o.jsx(y,{children:"Nombre Sección"}),o.jsx(H,{value:t.p_Nombre_seccion||"",disabled:!0})]}),o.jsxs(x,{className:"mb-3",children:[o.jsx(y,{children:"Asignatura"}),o.jsxs(ge,{value:t.p_Cod_grados_asignaturas||"",onChange:e=>M({...t,p_Cod_grados_asignaturas:e.target.value}),children:[o.jsx("option",{value:"",children:"Seleccione una asignatura"}),O.map(e=>o.jsx("option",{value:e.Cod_grados_asignaturas,children:e.Nombre_asignatura},e.Cod_grados_asignaturas))]})]}),o.jsxs(x,{className:"mb-3",children:[o.jsx(y,{children:"Días"}),o.jsx("div",{style:{display:"flex",flexDirection:"column",justifyContent:"space-between",marginLeft:"35px"},children:z.sort((e,r)=>{const a=["LU","MAR","MIE","JUE","VIE","SAB","DOM"];return a.indexOf(e.prefijo_dia.toUpperCase())-a.indexOf(r.prefijo_dia.toUpperCase())}).map(e=>o.jsx(ro,{label:e.dias.toUpperCase(),value:e.Cod_dias,checked:Array.isArray(t.p_Cod_dias)?t.p_Cod_dias.includes(e.Cod_dias):!1,onChange:r=>{const a=[...t.p_Cod_dias||[]];if(r.target.checked)a.push(e.Cod_dias);else{const s=a.indexOf(e.Cod_dias);s>-1&&a.splice(s,1)}M({...t,p_Cod_dias:a})}},e.Cod_dias))})]}),o.jsxs(x,{className:"mb-3",children:[o.jsx(y,{children:"Hora de Inicio"}),o.jsx(H,{type:"time",value:t.p_Hora_inicio||"",onChange:e=>M({...t,p_Hora_inicio:e.target.value})})]}),o.jsxs(x,{className:"mb-3",children:[o.jsx(y,{children:"Hora de Fin"}),o.jsx(H,{type:"time",value:t.p_Hora_fin||"",onChange:e=>M({...t,p_Hora_fin:e.target.value})})]})]}),o.jsxs(eo,{children:[o.jsx(f,{color:"secondary",onClick:te,children:"Cancelar"}),o.jsx(f,{color:"primary",onClick:we,children:"Guardar Cambios"})]})]})]}):o.jsx(He,{})};export{ao as decodeJWT,Mo as default};
