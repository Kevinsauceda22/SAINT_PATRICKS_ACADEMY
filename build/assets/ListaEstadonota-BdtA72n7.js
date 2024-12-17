import{r as d,x as De,j as o,h as I}from"./index-SVRFFNc9.js";import{C as m}from"./index.esm-DWwMdKxH.js";import{S as r}from"./sweetalert2.esm.all-D3pEHXw3.js";import{u as Ne}from"./usePermission-BCWksQX7.js";import ve from"./AccessDenied-yaDW3Jao.js";import{l as Ae}from"./logo_saint_patrick-xw7Wl8f3.js";import{E as ze}from"./jspdf.plugin.autotable-gke1D7B3.js";import{u as y,w as Be}from"./xlsx-lwdk4T0U.js";import{C as Re}from"./CContainer-BdNP0s3v.js";import{C as te,a as z}from"./CRow-Bf67u6lu.js";import{a as l}from"./CButton-D9GPTbB6.js";import{c as _e}from"./cil-plus-D8mtC-W5.js";import{C as Pe,a as Me,b as Fe,c as re}from"./CDropdownToggle-DlfIUTmX.js";import{c as Ie}from"./cil-description-MUzg6O3n.js";import{c as $e}from"./cil-file-CeQgYs_D.js";import{c as Le}from"./cil-spreadsheet-CJUvf_vM.js";import{C as B}from"./CInputGroup-D-McUFva.js";import{C as $}from"./CInputGroupText-Cfu0fzaY.js";import{c as Oe}from"./cil-search-CDkY_4k-.js";import{C as L}from"./CFormInput-B_gylY64.js";import{c as Ue}from"./cil-brush-alt-CV61lKqC.js";import{C as He}from"./CFormSelect-CzT7g5tb.js";import{C as Je,a as Ve,b as ae,c as O,d as We,e as U}from"./CTable-98qqrSRH.js";import{c as se}from"./cil-pen-53d2I-C-.js";import{c as ne}from"./cil-trash-CBbKHhHb.js";import{C as Ge}from"./CPagination-UopCEeNZ.js";import{C as H,a as J,b as V,c as W}from"./CModalHeader-Bhtr3bZe.js";import{C as G}from"./CModalTitle-M2mBvD_5.js";import{C as ie}from"./CForm-CYRkMwLo.js";import{c as qe}from"./cil-save-CHBg7z_U.js";import"./CConditionalPortal-DwBsYzTA.js";import"./CFormControlWrapper-OEJgTi6e.js";import"./CFormControlValidation-CtDkyDfm.js";import"./CFormLabel-szm2Dda9.js";import"./CBackdrop-BbuVwMMD.js";const Ro=()=>{const{canSelect:ce,loading:Ye,error:Ze,canDelete:le,canInsert:de,canUpdate:pe}=Ne("ListaEstadonota"),[R,ue]=d.useState([]),[me,E]=d.useState(!1),[xe,w]=d.useState(!1),[he,k]=d.useState(!1),[b,_]=d.useState(""),[h,P]=d.useState({}),[M,q]=d.useState({}),[Y,Z]=d.useState(""),[C,T]=d.useState(1),[j,fe]=d.useState(5),S=d.useRef(null),[ge,f]=d.useState(!1);d.useEffect(()=>{D();const e=localStorage.getItem("token");if(e)try{const a=De(e);console.log("Token decodificado:",a)}catch(a){console.error("Error al decodificar el token:",a)}},[]);const D=async()=>{try{const t=(await(await fetch("http://localhost:4000/api/estadoNotas/estadonota")).json()).map((s,n)=>({...s,originalIndex:n+1}));ue(t)}catch(e){console.error("Error al obtener los Estadonota:",e)}},K=(e,a)=>{const t=e.target,s=t.selectionStart;let n=t.value.toUpperCase().trimStart();const c=/^[A-ZÑÁÉÍÓÚ0-9\s,]*$/;if(/\s{2,}/.test(n)&&(r.fire({icon:"warning",title:"Espacios múltiples",text:"No se permite más de un espacio entre palabras.",confirmButtonText:"Aceptar"}),n=n.replace(/\s+/g," ")),!c.test(n)){r.fire({icon:"warning",title:"Caracteres no permitidos",text:"Solo se permiten letras y espacios.",confirmButtonText:"Aceptar"});return}const i=n.split(" ");for(let p of i){const u={};for(let x of p)if(u[x]=(u[x]||0)+1,u[x]>4){r.fire({icon:"warning",title:"Repetición de letras",text:`La letra "${x}" se repite más de 4 veces en la palabra "${p}".`,confirmButtonText:"Aceptar"});return}}t.value=n,a(n),f(!0),requestAnimationFrame(()=>{S.current&&S.current.setSelectionRange(s,s)})},N=e=>{e.preventDefault(),r.fire({icon:"warning",title:"Acción bloqueada",text:"Copiar y pegar no está permitido.",confirmButtonText:"Aceptar"})},v=(e,a)=>{ge?r.fire({title:"¿Estás seguro?",text:"Si cierras este formulario, perderás todos los datos ingresados.",icon:"warning",showCancelButton:!0,confirmButtonText:"Sí, cerrar",cancelButtonText:"Cancelar"}).then(t=>{t.isConfirmed&&(e(!1),a(),f(!1))}):(e(!1),a(),f(!1))},Q=()=>_(""),F=()=>P(""),be=async()=>{if(!b.trim()){r.fire({icon:"error",title:"Error",text:'El campo "Descripción" no puede estar vacío',confirmButtonText:"Aceptar"});return}const e=b.trim().toLowerCase();if(R.some(t=>t.Descripcion.trim().toLowerCase()===e)){r.fire({icon:"error",title:"Error",text:`El estado nota "${b}" ya existe`,confirmButtonText:"Aceptar"});return}try{const t=localStorage.getItem("token");if(!t){r.fire("Error","No tienes permiso para realizar esta acción","error");return}const s=I(t);if(!s.cod_usuario||!s.nombre_usuario)throw console.error("No se pudo obtener el código o el nombre de usuario del token"),new Error("No se pudo obtener el código o el nombre de usuario del token");const n=await fetch("http://localhost:4000/api/estadoNotas/crearestadonota",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({Descripcion:b})}),c=await n.json();if(n.ok){const i=`El usuario: ${s.nombre_usuario} ha creado nuevo estado nota: ${b} `;(await fetch("http://localhost:4000/api/bitacora/registro",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({cod_usuario:s.cod_usuario,cod_objeto:49,accion:"INSERT",descripcion:i})})).ok?console.log("Registro en bitácora exitoso"):r.fire("Error","No se pudo registrar la acción en la bitácora","error"),D(),E(!1),_(""),f(!1),r.fire({icon:"success",title:"¡Éxito!",text:"El estado nota se ha creado correctamente",confirmButtonText:"Aceptar"})}else r.fire({icon:"error",title:"Error de validación",text:c.Mensaje||"Hubo un problema al crear el estado nota"})}catch(t){console.error("Error al crear el estado nota:",t),r.fire({icon:"error",title:"Error en el servidor",text:"Hubo un problema en el servidor. Inténtalo más tarde"})}},Ce=async()=>{if(!h.Descripcion.trim()){r.fire({icon:"error",title:"Error",text:'El campo "Descripción" no puede estar vacío',confirmButtonText:"Aceptar"});return}const e=h.Descripcion.trim().toLowerCase();if(R.some(t=>t.Descripcion.trim().toLowerCase()===e&&t.Cod_estado!==h.Cod_estado)){r.fire({icon:"error",title:"Error",text:`El estado nota "${h.Descripcion}" ya existe`,confirmButtonText:"Aceptar"});return}try{const t=localStorage.getItem("token");if(!t){r.fire("Error","No tienes permiso para realizar esta acción","error");return}const s=I(t);if(!s.cod_usuario||!s.nombre_usuario)throw console.error("No se pudo obtener el código o el nombre de usuario del token"),new Error("No se pudo obtener el código o el nombre de usuario del token");const n=await fetch("http://localhost:4000/api/estadoNotas/actualizarestadonota",{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({Cod_estado:h.Cod_estado,Descripcion:h.Descripcion})}),c=await n.json();if(n.ok){const i=`El usuario: ${s.nombre_usuario} ha actualizado el estado asistencia a: ${h.Descripcion}`;(await fetch("http://localhost:4000/api/bitacora/registro",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({cod_usuario:s.cod_usuario,cod_objeto:49,accion:"UPDATE",descripcion:i})})).ok?console.log("Registro en bitácora exitoso"):r.fire("Error","No se pudo registrar la acción en la bitácora","error"),D(),w(!1),F(),f(!1),r.fire({icon:"success",title:"¡Éxito!",text:"El estado nota se ha actualizado correctamente",confirmButtonText:"Aceptar"})}else r.fire({icon:"error",title:"Error",text:c.Mensaje||"Hubo un problema al actualizar el estado nota."})}catch(t){console.error("Error al actualizar el estado nota:",t),r.fire({icon:"error",title:"Error",text:"Hubo un problema en el servidor. Inténtalo más tarde"})}},je=async()=>{try{const e=localStorage.getItem("token");if(!e){r.fire("Error","No tienes permiso para realizar esta acción","error");return}const a=I(e);if(!a.cod_usuario||!a.nombre_usuario)throw console.error("No se pudo obtener el código o el nombre de usuario del token"),new Error("No se pudo obtener el código o el nombre de usuario del token");const t=await fetch("http://localhost:4000/api/estadoNotas/eliminarestadonota",{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({Cod_estado:M.Cod_estado})}),s=await t.json();if(t.ok){const n=`El usuario: ${a.nombre_usuario} ha eliminado el estado nota: ${M.Descripcion}`;(await fetch("http://localhost:4000/api/bitacora/registro",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({cod_usuario:a.cod_usuario,cod_objeto:49,accion:"DELETE",descripcion:n})})).ok?console.log("Registro en bitácora exitoso"):r.fire("Error","No se pudo registrar la acción en la bitácora","error"),D(),k(!1),q({}),r.fire({icon:"success",title:"¡Éxito!",text:"El estado nota se ha eliminado correctamente",confirmButtonText:"Aceptar"})}else r.fire({icon:"error",title:"Error",text:s.Mensaje||"Hubo un problema al eliminar el estado nota."})}catch(e){console.error("Error al eliminar el estado nota:",e),r.fire({icon:"error",title:"Error",text:"Hubo un problema en el servidor. Inténtalo más tarde"})}},ye=e=>{P(e),w(!0),f(!1)},Ee=e=>{q(e),k(!0)},we=e=>{let t=e.target.value.toUpperCase().trimStart();const s=/^[A-ZÑÁÉÍÓÚ0-9\s,]*$/;if(/\s{2,}/.test(t)&&(r.fire({icon:"warning",title:"Espacios múltiples",text:"No se permite más de un espacio entre palabras.",confirmButtonText:"Aceptar"}),t=t.replace(/\s+/g," ")),!s.test(t)){r.fire({icon:"warning",title:"Caracteres no permitidos",text:"Solo se permiten letras, números y espacios.",confirmButtonText:"Aceptar"});return}const n=t.split(" ");for(let c of n){const i={};for(let p of c)if(i[p]=(i[p]||0)+1,i[p]>4){r.fire({icon:"warning",title:"Repetición de letras",text:`La letra "${p}" se repite más de 4 veces en la palabra "${c}".`,confirmButtonText:"Aceptar"});return}}Z(t),T(1)},A=R.filter(e=>e.Descripcion.toLowerCase().includes(Y.toLowerCase())),X=C*j,ke=X-j,g=A.slice(ke,X),ee=e=>{e>0&&e<=Math.ceil(A.length/j)&&T(e)};if(!ce)return o.jsx(ve,{});const Te=()=>{if(!g||g.length===0){r.fire({icon:"info",title:"Tabla vacía",text:"No hay datos disponibles para generar el reporte.",confirmButtonText:"Aceptar"});return}const e=new ze,a=new Image;a.src=Ae,a.onload=()=>{e.addImage(a,"PNG",10,10,30,30);let t=20;e.setFontSize(18),e.setTextColor(0,102,51),e.text("SAINT PATRICK'S ACADEMY",e.internal.pageSize.width/2,t,{align:"center"}),t+=12,e.setFontSize(16),e.text("Reporte de Estados Nota",e.internal.pageSize.width/2,t,{align:"center"}),t+=10,e.setFontSize(10),e.setTextColor(100),e.text("Casa Club del periodista, Colonia del Periodista",e.internal.pageSize.width/2,t,{align:"center"}),t+=4,e.text("Teléfono: (504) 2234-8871",e.internal.pageSize.width/2,t,{align:"center"}),t+=4,e.text("Correo: info@saintpatrickacademy.edu",e.internal.pageSize.width/2,t,{align:"center"}),t+=6,e.setLineWidth(.5),e.setDrawColor(0,102,51),e.line(10,t,e.internal.pageSize.width-10,t);const s=e.internal.pageSize.height;let n=1;e.autoTable({startY:t+4,head:[["#","Descripción"]],body:g.map((c,i)=>[i+1,`${c.Descripcion||""}`.trim()]),headStyles:{fillColor:[0,102,51],textColor:[255,255,255],fontSize:10},styles:{fontSize:10,cellPadding:3,halign:"center"},columnStyles:{0:{cellWidth:"auto"},1:{cellWidth:"auto"}},alternateRowStyles:{fillColor:[240,248,255]},didDrawPage:c=>{const i=new Date,p=`${i.toLocaleDateString()} ${i.toLocaleTimeString()}`;e.setFontSize(10),e.setTextColor(100),e.text(`Fecha y hora de generación: ${p}`,10,s-10);const u=e.internal.getNumberOfPages();e.text(`Página ${n} de ${u}`,e.internal.pageSize.width-30,s-10),n+=1}}),window.open(e.output("bloburl"),"_blank")},a.onerror=()=>{console.warn("No se pudo cargar el logo. El PDF se generará sin el logo."),window.open(e.output("bloburl"),"_blank")}},Se=()=>{if(!g||g.length===0){r.fire({icon:"info",title:"Tabla vacía",text:"No hay datos disponibles para generar el reporte excel.",confirmButtonText:"Aceptar"});return}const e=[["Saint Patrick Academy"],["Reporte de Estados Nota"],[],["#","Descripción"]],a=g.map((u,x)=>[x+1,u.Descripcion]),t=[...e,...a],s=y.aoa_to_sheet(t),n=y.decode_range(s["!ref"]);for(let u=0;u<=3;u++)for(let x=n.s.c;x<=n.e.c;x++){const oe=y.encode_cell({r:u,c:x});s[oe]&&(s[oe].s={font:{bold:!0,sz:14,color:{rgb:"FFFFFF"}},fill:{fgColor:{rgb:"15401D"}},alignment:{horizontal:"center"}})}const c=[{wpx:100},{wpx:100}];s["!cols"]=c;const i=y.book_new();y.book_append_sheet(i,s,"Reporte de Estados Nota"),Be(i,"Reporte_Estados_Nota.xlsx")};return o.jsxs(Re,{children:[o.jsxs(te,{className:"align-items-center mb-5",children:[o.jsx(z,{xs:"12",md:"9",children:o.jsx("h1",{className:"mb-0",children:"Mantenimiento Estado Nota"})}),o.jsxs(z,{xs:"12",md:"3",className:"text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center mt-3 mt-md-0",children:[de&&o.jsxs(l,{className:"mb-3 mb-md-0 me-md-3 gap-1 rounded shadow",style:{backgroundColor:"#4B6251",color:"white",transition:"all 0.3s ease",height:"40px",width:"auto",minWidth:"100px",padding:"0 16px",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center"},onMouseEnter:e=>{e.currentTarget.style.backgroundColor="#3C4B43",e.currentTarget.style.boxShadow="0 4px 8px rgba(0, 0, 0, 0.2)"},onMouseLeave:e=>{e.currentTarget.style.backgroundColor="#4B6251",e.currentTarget.style.boxShadow="none"},onClick:()=>{E(!0),f(!1)},children:[o.jsx(m,{icon:_e})," Nuevo"]}),o.jsxs(Pe,{className:"btn-sm d-flex align-items-center gap-1 rounded shadow",children:[o.jsxs(Me,{style:{backgroundColor:"#6C8E58",color:"white",cursor:"pointer",transition:"all 0.3s ease"},onMouseEnter:e=>{e.currentTarget.style.backgroundColor="#5A784C",e.currentTarget.style.boxShadow="0 4px 8px rgba(0, 0, 0, 0.2)"},onMouseLeave:e=>{e.currentTarget.style.backgroundColor="#6C8E58",e.currentTarget.style.boxShadow="none"},children:[o.jsx(m,{icon:Ie})," Reporte"]}),o.jsxs(Fe,{style:{position:"absolute",zIndex:1050,backgroundColor:"#fff",boxShadow:"0px 2px 8px rgba(0, 0, 0, 0.2)",borderRadius:"4px",overflow:"hidden"},children:[o.jsxs(re,{onClick:Te,style:{cursor:"pointer",outline:"none",backgroundColor:"transparent",padding:"0.5rem 1rem",fontSize:"0.85rem",color:"#333",borderBottom:"1px solid #eaeaea",transition:"background-color 0.1s"},onMouseOver:e=>e.target.style.backgroundColor="#f5f5f5",onMouseOut:e=>e.target.style.backgroundColor="transparent",children:[o.jsx(m,{icon:$e,size:"sm"})," Abrir en PDF"]}),o.jsxs(re,{onClick:Se,style:{cursor:"pointer",outline:"none",backgroundColor:"transparent",padding:"0.5rem 1rem",fontSize:"0.85rem",color:"#333",transition:"background-color 0.3s"},onMouseOver:e=>e.target.style.backgroundColor="#f5f5f5",onMouseOut:e=>e.target.style.backgroundColor="transparent",children:[o.jsx(m,{icon:Le,size:"sm"})," Descargar Excel"]})]})]})]})]}),o.jsxs(te,{className:"align-items-center mt-4 mb-2",children:[o.jsx(z,{xs:"12",md:"8",className:"d-flex flex-wrap align-items-center",children:o.jsxs(B,{className:"me-3",style:{width:"400px"},children:[o.jsx($,{children:o.jsx(m,{icon:Oe})}),o.jsx(L,{placeholder:"Buscar estado nota...",onChange:we,value:Y}),o.jsxs(l,{style:{border:"1px solid #ccc",transition:"all 0.1s ease-in-out",backgroundColor:"#F3F4F7",color:"#343a40"},onClick:()=>{Z(""),T(1)},onMouseEnter:e=>{e.currentTarget.style.backgroundColor="#E0E0E0",e.currentTarget.style.color="black"},onMouseLeave:e=>{e.currentTarget.style.backgroundColor="#F3F4F7",e.currentTarget.style.color="#343a40"},children:[o.jsx(m,{icon:Ue})," Limpiar"]})]})}),o.jsx(z,{xs:"12",md:"4",className:"text-md-end mt-2 mt-md-0",children:o.jsx(B,{className:"mt-2 mt-md-0",style:{width:"auto",display:"inline-block"},children:o.jsxs("div",{className:"d-inline-flex align-items-center",children:[o.jsx("span",{children:"Mostrar "}),o.jsxs(He,{style:{width:"80px",display:"inline-block",textAlign:"center"},onChange:e=>{const a=Number(e.target.value);fe(a),T(1)},value:j,children:[o.jsx("option",{value:"5",children:"5"}),o.jsx("option",{value:"10",children:"10"}),o.jsx("option",{value:"20",children:"20"})]}),o.jsx("span",{children:" registros"})]})})})]}),o.jsx("div",{className:"table-container",style:{maxHeight:"400px",overflowY:"scroll",marginBottom:"20px"},children:o.jsxs(Je,{striped:!0,bordered:!0,hover:!0,children:[o.jsx(Ve,{style:{position:"sticky",top:0,zIndex:1,backgroundColor:"#fff"},children:o.jsxs(ae,{children:[o.jsx(O,{style:{width:"50px"},children:"#"}),o.jsx(O,{style:{width:"300px"},children:"Descripción"}),o.jsx(O,{style:{width:"150px"},children:"Acciones"})]})}),o.jsx(We,{children:g.map(e=>o.jsxs(ae,{children:[o.jsx(U,{children:e.originalIndex}),o.jsx(U,{children:e.Descripcion}),o.jsxs(U,{children:[pe&&o.jsx(l,{style:{backgroundColor:"#F9B64E",marginRight:"10px"},onClick:()=>ye(e),children:o.jsx(m,{icon:se})}),le&&o.jsx(l,{style:{backgroundColor:"#E57368",marginRight:"10px"},onClick:()=>Ee(e),children:o.jsx(m,{icon:ne})})]})]},e.Cod_estado))})]})}),o.jsxs("div",{className:"pagination-container",style:{display:"flex",justifyContent:"center",alignItems:"center"},children:[o.jsxs(Ge,{"aria-label":"Page navigation",children:[o.jsx(l,{style:{backgroundColor:"#6f8173",color:"#D9EAD3"},disabled:C===1,onClick:()=>ee(C-1),children:"Anterior"}),o.jsx(l,{style:{marginLeft:"10px",backgroundColor:"#6f8173",color:"#D9EAD3"},disabled:C===Math.ceil(A.length/j),onClick:()=>ee(C+1),children:"Siguiente"})]}),o.jsxs("span",{style:{marginLeft:"10px"},children:["Página ",C," de ",Math.ceil(A.length/j)]})]}),o.jsxs(H,{visible:me,backdrop:"static",children:[o.jsxs(J,{closeButton:!1,children:[o.jsx(G,{children:"Nuevo Estado Nota"}),o.jsx(l,{className:"btn-close","aria-label":"Close",onClick:()=>v(E,Q)})]}),o.jsx(V,{children:o.jsx(ie,{children:o.jsxs(B,{className:"mb-3",children:[o.jsx($,{children:"Descripción"}),o.jsx(L,{ref:S,type:"text",placeholder:"Ingrese la descripción del estado",value:b,maxLength:50,onPaste:N,onCopy:N,onChange:e=>K(e,_)})]})})}),o.jsxs(W,{children:[o.jsx(l,{color:"secondary",onClick:()=>v(E,Q),children:"Cancelar"}),o.jsxs(l,{style:{backgroundColor:"#4B6251",color:"white"},onClick:be,children:[o.jsx(m,{icon:qe,style:{marginRight:"5px"}})," Guardar"]})]})]}),o.jsxs(H,{visible:xe,backdrop:"static",children:[o.jsxs(J,{closeButton:!1,children:[o.jsx(G,{children:"Actualizar Estado Nota"}),o.jsx(l,{className:"btn-close","aria-label":"Close",onClick:()=>v(w,F)})]}),o.jsx(V,{children:o.jsx(ie,{children:o.jsxs(B,{className:"mb-3",children:[o.jsx($,{children:"Descripción"}),o.jsx(L,{ref:S,type:"text",placeholder:"Ingrese la descripción del estado",value:h.Descripcion,maxLength:50,onPaste:N,onCopy:N,onChange:e=>K(e,a=>P({...h,Descripcion:a}))})]})})}),o.jsxs(W,{children:[o.jsx(l,{color:"secondary",onClick:()=>v(w,F),children:"Cancelar"}),o.jsxs(l,{style:{backgroundColor:"#F9B64E",color:"white"},onClick:Ce,children:[o.jsx(m,{icon:se,style:{marginRight:"5px"}})," Actualizar"]})]})]}),o.jsxs(H,{visible:he,onClose:()=>k(!1),backdrop:"static",children:[o.jsx(J,{children:o.jsx(G,{children:"Confirmar Eliminación"})}),o.jsx(V,{children:o.jsxs("p",{children:["¿Estás seguro de que deseas eliminar el estado: ",o.jsx("strong",{children:M.Descripcion}),"?"]})}),o.jsxs(W,{children:[o.jsx(l,{color:"secondary",onClick:()=>k(!1),children:"Cancelar"}),o.jsxs(l,{style:{backgroundColor:"#E57368",color:"white"},onClick:je,children:[o.jsx(m,{icon:ne,style:{marginRight:"5px"}})," Eliminar"]})]})]})]})};export{Ro as default};
