import{r as u,x as Ne,j as t,h as F}from"./index-SVRFFNc9.js";import{C as x}from"./index.esm-DWwMdKxH.js";import{S as r}from"./sweetalert2.esm.all-D3pEHXw3.js";import{l as Ee}from"./logo_saint_patrick-xw7Wl8f3.js";import{E as _e}from"./jspdf.plugin.autotable-gke1D7B3.js";import{u as y,w as ve}from"./xlsx-lwdk4T0U.js";import{u as Ae}from"./usePermission-BCWksQX7.js";import ze from"./AccessDenied-yaDW3Jao.js";import{C as Be}from"./CContainer-BdNP0s3v.js";import{C as oe,a as A}from"./CRow-Bf67u6lu.js";import{a as c}from"./CButton-D9GPTbB6.js";import{c as De}from"./cil-plus-D8mtC-W5.js";import{C as Re,a as Pe,b as Me,c as re}from"./CDropdownToggle-DlfIUTmX.js";import{c as Fe}from"./cil-description-MUzg6O3n.js";import{c as $e}from"./cil-file-CeQgYs_D.js";import{c as Le}from"./cil-spreadsheet-CJUvf_vM.js";import{C as z}from"./CInputGroup-D-McUFva.js";import{C as $}from"./CInputGroupText-Cfu0fzaY.js";import{c as Oe}from"./cil-search-CDkY_4k-.js";import{C as L}from"./CFormInput-B_gylY64.js";import{c as He}from"./cil-brush-alt-CV61lKqC.js";import{C as Ue}from"./CFormSelect-CzT7g5tb.js";import{C as Je,a as Ve,b as ne,c as O,d as We,e as H}from"./CTable-98qqrSRH.js";import{c as se}from"./cil-pen-53d2I-C-.js";import{c as ie}from"./cil-trash-CBbKHhHb.js";import{C as Ge}from"./CPagination-UopCEeNZ.js";import{C as U,a as J,b as V,c as W}from"./CModalHeader-Bhtr3bZe.js";import{C as G}from"./CModalTitle-M2mBvD_5.js";import{C as ae}from"./CForm-CYRkMwLo.js";import{c as qe}from"./cil-save-CHBg7z_U.js";import"./CConditionalPortal-DwBsYzTA.js";import"./CFormControlWrapper-OEJgTi6e.js";import"./CFormControlValidation-CtDkyDfm.js";import"./CFormLabel-szm2Dda9.js";import"./CBackdrop-BbuVwMMD.js";const zt=()=>{const{canSelect:le,loading:Ye,error:Ze,canDelete:ce,canInsert:de,canUpdate:ue}=Ae("ListaInstitutos"),[B,pe]=u.useState([]),[me,w]=u.useState(!1),[xe,k]=u.useState(!1),[he,T]=u.useState(!1),[b,q]=u.useState(""),[h,D]=u.useState({}),[R,Y]=u.useState({}),[Z,K]=u.useState(""),[C,I]=u.useState(1),[j,fe]=u.useState(5),S=u.useRef(null),[ge,f]=u.useState(!1);u.useEffect(()=>{N();const e=localStorage.getItem("token");if(e)try{const n=Ne(e);console.log("Token decodificado:",n)}catch(n){console.error("Error al decodificar el token:",n)}},[]);const N=async()=>{try{const o=(await(await fetch("http://74.50.68.87:4000/api/instituto/instituto")).json()).map((s,i)=>({...s,originalIndex:i+1}));pe(o)}catch(e){console.error("Error al obtener los Institutos:",e)}},Q=(e,n)=>{const o=e.target,s=o.selectionStart;let i=o.value.toUpperCase().trimStart();const d=/^[A-ZÑÁÉÍÓÚ0-9\s,]*$/;if(/\s{2,}/.test(i)&&(r.fire({icon:"warning",title:"Espacios múltiples",text:"No se permite más de un espacio entre palabras.",confirmButtonText:"Aceptar"}),i=i.replace(/\s+/g," ")),!d.test(i)){r.fire({icon:"warning",title:"Caracteres no permitidos",text:"Solo se permiten letras y espacios.",confirmButtonText:"Aceptar"});return}const a=i.split(" ");for(let l of a){const m={};for(let p of l)if(m[p]=(m[p]||0)+1,m[p]>4){r.fire({icon:"warning",title:"Repetición de letras",text:`La letra "${p}" se repite más de 4 veces en la palabra "${l}".`,confirmButtonText:"Aceptar"});return}}o.value=i,n(i),f(!0),requestAnimationFrame(()=>{S.current&&S.current.setSelectionRange(s,s)})},E=e=>{e.preventDefault(),r.fire({icon:"warning",title:"Acción bloqueada",text:"Copiar y pegar no está permitido.",confirmButtonText:"Aceptar"})},_=(e,n)=>{ge?r.fire({title:"¿Estás seguro?",text:"Si cierras este formulario, perderás todos los datos ingresados.",icon:"warning",showCancelButton:!0,confirmButtonText:"Sí, cerrar",cancelButtonText:"Cancelar"}).then(o=>{o.isConfirmed&&(e(!1),n(),f(!1))}):(e(!1),n(),f(!1))},P=()=>q(""),M=()=>D(""),be=async()=>{if(!b.trim()){r.fire({icon:"error",title:"Error",text:'El campo "Nombre de Instituto" no puede estar vacío',confirmButtonText:"Aceptar"});return}const e=b.trim().toLowerCase();if(B.some(o=>o.Nom_Instituto.trim().toLowerCase()===e)){r.fire({icon:"error",title:"Error",text:`El instituto "${b}" ya existe`,confirmButtonText:"Aceptar"});return}try{const o=localStorage.getItem("token");if(!o){r.fire("Error","No tienes permiso para realizar esta acción","error");return}const s=F(o);if(!s.cod_usuario||!s.nombre_usuario)throw console.error("No se pudo obtener el código o el nombre de usuario del token"),new Error("No se pudo obtener el código o el nombre de usuario del token");const i=await fetch("http://74.50.68.87:4000/api/instituto/crearinstituto",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${o}`},body:JSON.stringify({Nom_Instituto:b})}),d=await i.json();if(i.ok){const a=`El usuario: ${s.nombre_usuario} ha creado nuevo instituto: ${b} `;(await fetch("http://74.50.68.87:4000/api/bitacora/registro",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${o}`},body:JSON.stringify({cod_usuario:s.cod_usuario,cod_objeto:104,accion:"INSERT",descripcion:a})})).ok?console.log("Registro en bitácora exitoso"):r.fire("Error","No se pudo registrar la acción en la bitácora","error"),N(),w(!1),P(),f(!1),r.fire({icon:"success",title:"¡Éxito!",text:"El instituto se ha creado correctamente",confirmButtonText:"Aceptar"})}else r.fire({icon:"error",title:"Error",text:d.Mensaje||"Hubo un problema al crear el instituto"})}catch(o){console.error("Error al crear el instituto",o),r.fire({icon:"error",title:"Error en el servidor",text:"Hubo un problema en el servidor. Inténtalo más tarde"})}},Ce=async()=>{if(!h.Nom_Instituto.trim()){r.fire({icon:"error",title:"Error",text:'El campo "Nombre del Instituto" no puede estar vacío',confirmButtonText:"Aceptar"});return}const e=h.Nom_Instituto.trim().toLowerCase();if(B.some(o=>o.Nom_Instituto.trim().toLowerCase()===e&&o.Cod_Institutos!==h.Cod_Instituto)){r.fire({icon:"error",title:"Error",text:`El instituto "${h.Nom_Instituto}" ya existe`,confirmButtonText:"Aceptar"});return}try{const o=localStorage.getItem("token");if(!o){r.fire("Error","No tienes permiso para realizar esta acción","error");return}const s=F(o);if(!s.cod_usuario||!s.nombre_usuario)throw console.error("No se pudo obtener el código o el nombre de usuario del token"),new Error("No se pudo obtener el código o el nombre de usuario del token");const i=await fetch("http://74.50.68.87:4000/api/instituto/actualizarinstituto",{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${o}`},body:JSON.stringify({Cod_Instituto:h.Cod_Instituto,Nom_Instituto:h.Nom_Instituto})}),d=await i.json();if(i.ok){const a=`El usuario: ${s.nombre_usuario} ha actualizado el estado asistencia a: ${h.Nom_Instituto}`;(await fetch("http://74.50.68.87:4000/api/bitacora/registro",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${o}`},body:JSON.stringify({cod_usuario:s.cod_usuario,cod_objeto:104,accion:"UPDATE",descripcion:a})})).ok?console.log("Registro en bitácora exitoso"):r.fire("Error","No se pudo registrar la acción en la bitácora","error"),N(),k(!1),M(),f(!1),r.fire({icon:"success",title:"¡Éxito!",text:"El instituto se ha actualizado correctamente",confirmButtonText:"Aceptar"})}else r.fire({icon:"error",title:"Error",text:d.Mensaje||"Hubo un problema al actualizar el instituto."})}catch(o){console.error("Hubo un problema al actualizar el instituto:",o),r.fire({icon:"error",title:"Error",text:"Hubo un problema en el servidor. Inténtalo más tarde"})}},je=async()=>{try{const e=localStorage.getItem("token");if(!e){r.fire("Error","No tienes permiso para realizar esta acción","error");return}const n=F(e);if(!n.cod_usuario||!n.nombre_usuario)throw console.error("No se pudo obtener el código o el nombre de usuario del token"),new Error("No se pudo obtener el código o el nombre de usuario del token");const o=await fetch("http://74.50.68.87:4000/api/instituto/eliminarinstituto",{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({Cod_Instituto:R.Cod_Instituto})}),s=await o.json();if(o.ok){const i=`El usuario: ${n.nombre_usuario} ha eliminado el instituto: ${R.Nom_Instituto}`;(await fetch("http://74.50.68.87:4000/api/bitacora/registro",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({cod_usuario:n.cod_usuario,cod_objeto:104,accion:"DELETE",descripcion:i})})).ok?console.log("Registro en bitácora exitoso"):r.fire("Error","No se pudo registrar la acción en la bitácora","error"),N(),T(!1),Y({}),r.fire({icon:"success",title:"¡Éxito!",text:"El instituto se ha eliminado correctamente.",confirmButtonText:"Aceptar"})}else r.fire({icon:"error",title:"Error",text:s.Mensaje||"Hubo un problema al eliminar el instituto."})}catch(e){console.error("Error al eliminar el instituto:",e),r.fire({icon:"error",title:"Error",text:"Hubo un problema en el servidor. Inténtalo más tarde"})}},ye=e=>{D(e),k(!0),f(!1)},we=e=>{Y(e),T(!0)},ke=e=>{let o=e.target.value.toUpperCase().trimStart();const s=/^[A-ZÑÁÉÍÓÚ0-9\s,]*$/;if(/\s{2,}/.test(o)&&(r.fire({icon:"warning",title:"Espacios múltiples",text:"No se permite más de un espacio entre palabras.",confirmButtonText:"Aceptar"}),o=o.replace(/\s+/g," ")),!s.test(o)){r.fire({icon:"warning",title:"Caracteres no permitidos",text:"Solo se permiten letras, números y espacios.",confirmButtonText:"Aceptar"});return}const i=o.split(" ");for(let d of i){const a={};for(let l of d)if(a[l]=(a[l]||0)+1,a[l]>4){r.fire({icon:"warning",title:"Repetición de letras",text:`La letra "${l}" se repite más de 4 veces en la palabra "${d}".`,confirmButtonText:"Aceptar"});return}}K(o),I(1)},v=B.filter(e=>e.Nom_Instituto.toLowerCase().includes(Z.toLowerCase())),X=C*j,Te=X-j,g=v.slice(Te,X),ee=e=>{e>0&&e<=Math.ceil(v.length/j)&&I(e)};if(!le)return t.jsx(ze,{});const Ie=()=>{if(!g||g.length===0){r.fire({icon:"info",title:"Tabla vacía",text:"No hay datos disponibles para generar el reporte.",confirmButtonText:"Aceptar"});return}const e=new _e,n=new Image;n.src=Ee,n.onload=()=>{e.addImage(n,"PNG",10,10,30,30);let o=20;e.setFontSize(18),e.setTextColor(0,102,51),e.text("SAINT PATRICK'S ACADEMY",e.internal.pageSize.width/2,o,{align:"center"}),o+=12,e.setFontSize(16),e.text("Reporte de Institutos",e.internal.pageSize.width/2,o,{align:"center"}),o+=10,e.setFontSize(10),e.setTextColor(100),e.text("Casa Club del periodista, Colonia del Periodista",e.internal.pageSize.width/2,o,{align:"center"}),o+=4,e.text("Teléfono: (504) 2234-8871",e.internal.pageSize.width/2,o,{align:"center"}),o+=4,e.text("Correo: info@saintpatrickacademy.edu",e.internal.pageSize.width/2,o,{align:"center"}),o+=6,e.setLineWidth(.5),e.setDrawColor(0,102,51),e.line(10,o,e.internal.pageSize.width-10,o);const s=e.internal.pageSize.height;e.autoTable({startY:o+4,head:[["#","Nombre"]],body:g.map((a,l)=>[l+1,`${a.Nom_Instituto||""}`.trim()]),headStyles:{fillColor:[0,102,51],textColor:[255,255,255],fontSize:10},styles:{fontSize:10,cellPadding:3,halign:"center"},columnStyles:{0:{cellWidth:"auto"},1:{cellWidth:"auto"}},alternateRowStyles:{fillColor:[240,248,255]},didDrawPage:a=>{const l=new Date,m=`${l.toLocaleDateString()} ${l.toLocaleTimeString()}`,p=e.internal.pageSize.height;e.setFontSize(10),e.setTextColor(100),e.text(`Fecha y hora de generación: ${m}`,10,p-10)}});const i=e.internal.getNumberOfPages(),d=e.internal.pageSize.width;for(let a=1;a<=i;a++){e.setPage(a),e.setTextColor(100);const l=`Página ${a} de ${i}`;e.text(l,d-30,s-10)}window.open(e.output("bloburl"),"_blank")},n.onerror=()=>{console.warn("No se pudo cargar el logo. El PDF se generará sin el logo."),window.open(e.output("bloburl"),"_blank")}},Se=()=>{if(!g||g.length===0){r.fire({icon:"info",title:"Tabla vacía",text:"No hay datos disponibles para generar el reporte excel.",confirmButtonText:"Aceptar"});return}const e=[["Saint Patrick Academy"],["Reporte de Institutos"],[],["#","Nombre"]],n=g.map((m,p)=>[p+1,m.Nom_Instituto]),o=[...e,...n],s=y.aoa_to_sheet(o),i=y.decode_range(s["!ref"]);for(let m=0;m<=3;m++)for(let p=i.s.c;p<=i.e.c;p++){const te=y.encode_cell({r:m,c:p});s[te]&&(s[te].s={font:{bold:!0,sz:14,color:{rgb:"FFFFFF"}},fill:{fgColor:{rgb:"15401D"}},alignment:{horizontal:"center"}})}const d=[{wpx:100},{wpx:100}];s["!cols"]=d;const a=y.book_new();y.book_append_sheet(a,s,"Reporte de Institutos"),ve(a,"Reporte_Institutos.xlsx")};return t.jsxs(Be,{children:[t.jsxs(oe,{className:"align-items-center mb-5",children:[t.jsx(A,{xs:"12",md:"9",children:t.jsx("h1",{className:"mb-0",children:"Mantenimiento Institutos"})}),t.jsxs(A,{xs:"12",md:"3",className:"text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center mt-3 mt-md-0",children:[de&&t.jsxs(c,{className:"mb-3 mb-md-0 me-md-3 gap-1 rounded shadow",style:{backgroundColor:"#4B6251",color:"white",transition:"all 0.3s ease",height:"40px",width:"auto",minWidth:"100px",padding:"0 16px",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center"},onMouseEnter:e=>{e.currentTarget.style.backgroundColor="#3C4B43",e.currentTarget.style.boxShadow="0 4px 8px rgba(0, 0, 0, 0.2)"},onMouseLeave:e=>{e.currentTarget.style.backgroundColor="#4B6251",e.currentTarget.style.boxShadow="none"},onClick:()=>{w(!0),f(!1)},children:[t.jsx(x,{icon:De})," Nuevo"]}),t.jsxs(Re,{className:"btn-sm d-flex align-items-center gap-1 rounded shadow",children:[t.jsxs(Pe,{style:{backgroundColor:"#6C8E58",color:"white",cursor:"pointer",transition:"all 0.3s ease"},onMouseEnter:e=>{e.currentTarget.style.backgroundColor="#5A784C",e.currentTarget.style.boxShadow="0 4px 8px rgba(0, 0, 0, 0.2)"},onMouseLeave:e=>{e.currentTarget.style.backgroundColor="#6C8E58",e.currentTarget.style.boxShadow="none"},children:[t.jsx(x,{icon:Fe})," Reporte"]}),t.jsxs(Me,{style:{position:"absolute",zIndex:1050,backgroundColor:"#fff",boxShadow:"0px 2px 8px rgba(0, 0, 0, 0.2)",borderRadius:"4px",overflow:"hidden"},children:[t.jsxs(re,{onClick:Ie,style:{cursor:"pointer",outline:"none",backgroundColor:"transparent",padding:"0.5rem 1rem",fontSize:"0.85rem",color:"#333",borderBottom:"1px solid #eaeaea",transition:"background-color 0.1s"},onMouseOver:e=>e.target.style.backgroundColor="#f5f5f5",onMouseOut:e=>e.target.style.backgroundColor="transparent",children:[t.jsx(x,{icon:$e,size:"sm"})," Abrir en PDF"]}),t.jsxs(re,{onClick:Se,style:{cursor:"pointer",outline:"none",backgroundColor:"transparent",padding:"0.5rem 1rem",fontSize:"0.85rem",color:"#333",transition:"background-color 0.3s"},onMouseOver:e=>e.target.style.backgroundColor="#f5f5f5",onMouseOut:e=>e.target.style.backgroundColor="transparent",children:[t.jsx(x,{icon:Le,size:"sm"})," Descargar Excel"]})]})]})]})]}),t.jsxs(oe,{className:"align-items-center mt-4 mb-2",children:[t.jsx(A,{xs:"12",md:"8",className:"d-flex flex-wrap align-items-center",children:t.jsxs(z,{className:"me-3",style:{width:"400px"},children:[t.jsx($,{children:t.jsx(x,{icon:Oe})}),t.jsx(L,{placeholder:"Buscar instituto...",onChange:ke,value:Z}),t.jsxs(c,{style:{border:"1px solid #ccc",transition:"all 0.1s ease-in-out",backgroundColor:"#F3F4F7",color:"#343a40"},onClick:()=>{K(""),I(1)},onMouseEnter:e=>{e.currentTarget.style.backgroundColor="#E0E0E0",e.currentTarget.style.color="black"},onMouseLeave:e=>{e.currentTarget.style.backgroundColor="#F3F4F7",e.currentTarget.style.color="#343a40"},children:[t.jsx(x,{icon:He})," Limpiar"]})]})}),t.jsx(A,{xs:"12",md:"4",className:"text-md-end mt-2 mt-md-0",children:t.jsx(z,{className:"mt-2 mt-md-0",style:{width:"auto",display:"inline-block"},children:t.jsxs("div",{className:"d-inline-flex align-items-center",children:[t.jsx("span",{children:"Mostrar "}),t.jsxs(Ue,{style:{width:"80px",display:"inline-block",textAlign:"center"},onChange:e=>{const n=Number(e.target.value);fe(n),I(1)},value:j,children:[t.jsx("option",{value:"5",children:"5"}),t.jsx("option",{value:"10",children:"10"}),t.jsx("option",{value:"20",children:"20"})]}),t.jsx("span",{children:" registros"})]})})})]}),t.jsx("div",{className:"table-container",style:{maxHeight:"400px",overflowY:"scroll",marginBottom:"20px"},children:t.jsxs(Je,{striped:!0,bordered:!0,hover:!0,children:[t.jsx(Ve,{style:{position:"sticky",top:0,zIndex:1,backgroundColor:"#fff"},children:t.jsxs(ne,{children:[t.jsx(O,{style:{width:"50px"},children:"#"}),t.jsx(O,{style:{width:"300px"},children:"Nombre "}),t.jsx(O,{style:{width:"150px"},children:"Acciones"})]})}),t.jsx(We,{children:g.map(e=>t.jsxs(ne,{children:[t.jsx(H,{children:e.originalIndex}),t.jsx(H,{children:e.Nom_Instituto}),t.jsxs(H,{children:[ue&&t.jsx(c,{style:{backgroundColor:"#F9B64E",marginRight:"10px"},onClick:()=>ye(e),children:t.jsx(x,{icon:se})}),ce&&t.jsx(c,{style:{backgroundColor:"#E57368",marginRight:"10px"},onClick:()=>we(e),children:t.jsx(x,{icon:ie})})]})]},e.Cod_Instituto))})]})}),t.jsxs("div",{className:"pagination-container",style:{display:"flex",justifyContent:"center",alignItems:"center"},children:[t.jsxs(Ge,{"aria-label":"Page navigation",children:[t.jsx(c,{style:{backgroundColor:"#6f8173",color:"#D9EAD3"},disabled:C===1,onClick:()=>ee(C-1),children:"Anterior"}),t.jsx(c,{style:{marginLeft:"10px",backgroundColor:"#6f8173",color:"#D9EAD3"},disabled:C===Math.ceil(v.length/j),onClick:()=>ee(C+1),children:"Siguiente"})]}),t.jsxs("span",{style:{marginLeft:"10px"},children:["Página ",C," de ",Math.ceil(v.length/j)]})]}),t.jsxs(U,{visible:me,backdrop:"static",children:[t.jsxs(J,{closeButton:!1,children:[t.jsx(G,{children:"Nuevo Instituto"}),t.jsx(c,{className:"btn-close","aria-label":"Close",onClick:()=>_(w,P)})]}),t.jsx(V,{children:t.jsx(ae,{children:t.jsxs(z,{className:"mb-3",children:[t.jsx($,{children:"Nombre del Instituto"}),t.jsx(L,{ref:S,type:"text",placeholder:"Ingrese el nombre del instituto",value:b,maxLength:50,onPaste:E,onCopy:E,onChange:e=>Q(e,q)})]})})}),t.jsxs(W,{children:[t.jsx(c,{color:"secondary",onClick:()=>_(w,P),children:"Cancelar"}),t.jsxs(c,{style:{backgroundColor:"#4B6251",color:"white"},onMouseEnter:e=>e.currentTarget.style.backgroundColor="#3C4B43",onMouseLeave:e=>e.currentTarget.style.backgroundColor="#4B6251",onClick:be,children:[t.jsx(x,{icon:qe,style:{marginRight:"5px"}})," Guardar"]})]})]}),t.jsxs(U,{visible:xe,backdrop:"static",children:[t.jsxs(J,{closeButton:!1,children:[t.jsx(G,{children:"Actualizar Instituto"}),t.jsx(c,{className:"btn-close","aria-label":"Close",onClick:()=>_(k,M)})]}),t.jsx(V,{children:t.jsx(ae,{children:t.jsxs(z,{className:"mb-3",children:[t.jsx($,{children:"Nombre del Instituto"}),t.jsx(L,{ref:S,type:"text",placeholder:"Ingrese el nombre del instituto",value:h.Nom_Instituto,maxLength:50,onPaste:E,onCopy:E,onChange:e=>Q(e,n=>D({...h,Nom_Instituto:n}))})]})})}),t.jsxs(W,{children:[t.jsx(c,{color:"secondary",onClick:()=>_(k,M),children:"Cancelar"}),t.jsxs(c,{style:{backgroundColor:"#F9B64E",color:"white"},onClick:Ce,children:[t.jsx(x,{icon:se,style:{marginRight:"5px"}})," Actualizar"]})]})]}),t.jsxs(U,{visible:he,onClose:()=>T(!1),backdrop:"static",children:[t.jsx(J,{children:t.jsx(G,{children:"Confirmar Eliminación"})}),t.jsx(V,{children:t.jsxs("p",{children:["¿Estás seguro de que deseas eliminar el instituto: ",t.jsx("strong",{children:R.Nom_Instituto}),"?"]})}),t.jsxs(W,{children:[t.jsx(c,{color:"secondary",onClick:()=>T(!1),children:"Cancelar"}),t.jsxs(c,{style:{backgroundColor:"#E57368",color:"white"},onClick:je,children:[t.jsx(x,{icon:ie,style:{marginRight:"5px"}})," Eliminar"]})]})]})]})};export{zt as default};
