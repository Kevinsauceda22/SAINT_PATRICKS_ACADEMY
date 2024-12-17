import{r as n,j as o}from"./index-SVRFFNc9.js";import{C as ee}from"./index.esm-DWwMdKxH.js";import{S as a}from"./sweetalert2.esm.all-D3pEHXw3.js";import{E as Te}from"./jspdf.plugin.autotable-gke1D7B3.js";import{u as V,a as Pe}from"./xlsx-lwdk4T0U.js";import{F as ke}from"./FileSaver.min-DN8zk8MP.js";import{l as De}from"./logo_saint_patrick-xw7Wl8f3.js";import{u as Le}from"./usePermission-BCWksQX7.js";import Ie from"./AccessDenied-yaDW3Jao.js";import{C as Re}from"./CContainer-BdNP0s3v.js";import{a as c}from"./CButton-D9GPTbB6.js";import{C as Me,a as ze,b as Ue,c as oe}from"./CDropdownToggle-DlfIUTmX.js";import{C as Ve}from"./CInputGroup-D-McUFva.js";import{C as Be}from"./CInputGroupText-Cfu0fzaY.js";import{C as u}from"./CFormInput-B_gylY64.js";import{C as Fe,a as We,b as se,c as y,d as $e,e as _}from"./CTable-98qqrSRH.js";import{c as He}from"./cil-pen-53d2I-C-.js";import{c as Oe}from"./cil-trash-CBbKHhHb.js";import{C as Ge}from"./CPagination-UopCEeNZ.js";import{C as B,a as F,b as W,c as $}from"./CModalHeader-Bhtr3bZe.js";import{C as H}from"./CModalTitle-M2mBvD_5.js";import{C as ie}from"./CForm-CYRkMwLo.js";import"./CConditionalPortal-DwBsYzTA.js";import"./CFormControlWrapper-OEJgTi6e.js";import"./CFormControlValidation-CtDkyDfm.js";import"./CFormLabel-szm2Dda9.js";import"./CBackdrop-BbuVwMMD.js";const wo=()=>{const{canSelect:te,loading:qe,canDelete:re,canInsert:Ye,canUpdate:ae}=Le("edificios"),[w,ne]=n.useState([]),[r,E]=n.useState({Numero_pisos:"",Aulas_disponibles:"",pisosVsAulas:""}),[le,v]=n.useState(!1),[ce,A]=n.useState(!1),[de,S]=n.useState(!1),[d,T]=n.useState({Nombre_edificios:"",Numero_pisos:"",Aulas_disponibles:""}),[p,C]=n.useState({}),[O,G]=n.useState({}),[q,Y]=n.useState(""),[f,P]=n.useState(1),[h,pe]=n.useState(5),[me,x]=n.useState(!1);n.useEffect(()=>{k()},[]);const k=async()=>{try{const i=(await(await fetch("http://localhost:4000/api/edificio/edificios")).json()).map((t,g)=>({...t,originalIndex:g+1}));ne(i)}catch(e){console.error("Error al obtener los edificios:",e)}},ue=async()=>{const e=K(d.Nombre_edificios.trim().replace(/\s+/g," "));if(J(e)&&xe()&&!ge())try{(await fetch("http://localhost:4000/api/edificio/crear_edificio",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({p_Nombre_edificio:e,p_Numero_pisos:d.Numero_pisos,p_Aulas_disponibles:d.Aulas_disponibles})})).ok?(k(),v(!1),R(),x(!1),a.fire({icon:"success",title:"Creación exitosa",text:"El edificio ha sido creado correctamente."})):a.fire({icon:"error",title:"Error",text:"No se pudo crear el edificio."})}catch(s){console.error("Error al crear el edificio:",s)}},fe=async()=>{const e=K(p.Nombre_edificios.trim().replace(/\s+/g," "));if(J(e))try{(await fetch("http://localhost:4000/api/edificio/actualizar_edificio",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({p_Cod_edificio:p.Cod_edificio,p_Nuevo_nombre_edificio:e,p_Numero_pisos:p.Numero_pisos,p_Aulas_disponibles:p.Aulas_disponibles})})).ok?(k(),A(!1),M(),x(!1),a.fire({icon:"success",title:"Actualización exitosa",text:"El edificio ha sido actualizado correctamente."})):a.fire({icon:"error",title:"Error",text:"No se pudo actualizar el edificio."})}catch(s){console.error("Error al actualizar el edificio:",s)}},he=async()=>{try{(await fetch(`http://localhost:4000/api/edificio/${encodeURIComponent(O.Cod_edificio)}`,{method:"DELETE",headers:{"Content-Type":"application/json"}})).ok?(k(),S(!1),G({}),a.fire({icon:"success",title:"Eliminación exitosa",text:"El edificio ha sido eliminado correctamente."})):a.fire({icon:"error",title:"Error",text:"No se pudo eliminar el edificio."})}catch(e){console.error("Error al eliminar el edificio:",e)}},J=e=>{const s=/^[a-zA-Z\s]*$/,i=!/\s{2,}/.test(e),t=e.trim().replace(/\s+/g," ");if(!s.test(t))return a.fire({icon:"warning",title:"Nombre inválido",text:"El nombre del edificio solo puede contener letras y espacios."}),!1;if(!i)return a.fire({icon:"warning",title:"Espacios múltiples",text:"No se permite más de un espacio entre palabras."}),!1;const g=t.split(" ");for(let N of g){const m={};for(let b of N)if(m[b]=(m[b]||0)+1,m[b]>4)return a.fire({icon:"warning",title:"Repetición de letras",text:`La letra "${b}" se repite más de 4 veces en la palabra "${N}".`}),!1}return!0},K=e=>e.replace(/\b\w/g,s=>s.toUpperCase()),I=(e,s)=>{s.length>2||s<=0||isNaN(s)?E(i=>({...i,[e]:"El número debe ser mayor que 0 y tener un máximo de 2 dígitos."})):E(i=>({...i,[e]:""}))},xe=()=>{const{Nombre_edificios:e,Numero_pisos:s,Aulas_disponibles:i}=d;return!e||!s||!i?(a.fire({icon:"warning",title:"Campos vacíos",text:"Todos los campos deben estar llenos para poder crear un edificio."}),!1):!0},ge=()=>{const e=d.Nombre_edificios.trim().toLowerCase();return w.find(i=>i.Nombre_edificios.trim().toLowerCase()===e)?(a.fire({icon:"warning",title:"Nombre duplicado",text:"Ya existe un edificio con este nombre."}),!0):!1},Z=(e,s)=>{const i=e.target.selectionStart;let t=e.target.value;if(t=t.replace(/\s{2,}/g," "),!t.split(" ").every(m=>!/(.)\1{3,}/.test(m))){a.fire({icon:"warning",title:"Repetición de letras",text:"No se permite que la misma letra se repita más de 4 veces consecutivas."}),e.target.setSelectionRange(i,i);return}s(m=>({...m,Nombre_edificios:t})),x(!0),setTimeout(()=>{e.target.setSelectionRange(i,i)},0)},l=e=>{e.preventDefault(),a.fire({icon:"warning",title:"Acción bloqueada",text:"Copiar y pegar no está permitido."})},be=(e,s)=>{const i=e.target.value;parseInt(i)<parseInt(d.Numero_pisos)?E(t=>({...t,pisosVsAulas:"El número de pisos es mayor que el número de aulas."})):E(t=>({...t,pisosVsAulas:""})),s(t=>({...t,Aulas_disponibles:i}))},D=(e,s)=>{me?a.fire({title:"¿Estás seguro?",text:"Si cierras este formulario, perderás todos los datos ingresados.",icon:"warning",showCancelButton:!0,confirmButtonText:"Sí, cerrar",cancelButtonText:"Cancelar"}).then(i=>{i.isConfirmed&&(e(!1),s(),x(!1))}):(e(!1),s())},R=()=>{T({Nombre_edificios:"",Numero_pisos:"",Aulas_disponibles:""})},M=()=>{C({Nombre_edificios:"",Numero_pisos:"",Aulas_disponibles:""})},Ce=()=>{const e=V.json_to_sheet(w),s=V.book_new();V.book_append_sheet(s,e,"Edificios");const i=Pe(s,{bookType:"xlsx",type:"array"}),t=new Blob([i],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});ke.saveAs(t,"reporte_edificios.xlsx")},je=()=>{const e=new Te({orientation:"portrait",unit:"mm",format:"a4"}),s=new Image;s.src=De,s.onload=()=>{const i=e.internal.pageSize.width,t=e.internal.pageSize.height;e.addImage(s,"PNG",10,10,45,45),e.setFontSize(18),e.setTextColor(0,102,51),e.text("SAINT PATRICK'S ACADEMY",i/2,24,{align:"center"}),e.setFontSize(10),e.setTextColor(100),e.text("Casa Club del periodista, Colonia del Periodista",i/2,32,{align:"center"}),e.text("Teléfono: (504) 2234-8871",i/2,37,{align:"center"}),e.text("Correo: info@saintpatrickacademy.edu",i/2,42,{align:"center"}),e.setFontSize(14),e.setTextColor(0,102,51),e.text("Reporte General de Edificios",i/2,50,{align:"center"}),e.setLineWidth(.5),e.setDrawColor(0,102,51),e.line(10,55,i-10,55);const g=["#","Nombre del Edificio","Número de Pisos","Aulas Disponibles"],N=w.map((L,U)=>[{content:(U+1).toString(),styles:{halign:"center"}},{content:L.Nombre_edificios.toUpperCase(),styles:{halign:"left"}},{content:L.Numero_pisos.toString(),styles:{halign:"center"}},{content:L.Aulas_disponibles.toString(),styles:{halign:"center"}}]);e.autoTable({startY:65,head:[g],body:N,headStyles:{fillColor:[0,102,51],textColor:[255,255,255],fontSize:10,halign:"center"},styles:{fontSize:10,cellPadding:3},alternateRowStyles:{fillColor:[240,248,255]},margin:{top:10,bottom:30},didDrawPage:function(L){const U=e.internal.getNumberOfPages(),ve=e.internal.getCurrentPageInfo().pageNumber;e.setFontSize(10),e.setTextColor(0,102,51),e.text(`Página ${ve} de ${U}`,i-10,t-10,{align:"right"});const X=new Date,Ae=X.toLocaleDateString("es-HN",{year:"numeric",month:"long",day:"numeric"}),Se=X.toLocaleTimeString("es-HN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});e.text(`Fecha de generación: ${Ae} Hora: ${Se}`,10,t-10)}});const m=e.output("blob"),b=URL.createObjectURL(m);window.open("","_blank").document.write(`
        <html>
          <head><title>Reporte de Edificios</title></head>
          <body style="margin: 0; overflow: hidden;">
            <iframe width="100%" height="100%" src="${b}" frameborder="0" style="border: none;"></iframe>
          </body>
        </html>`)},s.onerror=()=>{a.fire("Error","No se pudo cargar el logo.","error")}},Ne=e=>{C(e),A(!0),x(!1)},ye=e=>{G(e),S(!0)},_e=e=>{Y(e.target.value),P(1)},j=w.filter(e=>e.Nombre_edificios.toLowerCase().includes(q.toLowerCase())),Q=f*h,we=Q-h,Ee=j.slice(we,Q),z=e=>{e>0&&e<=Math.ceil(j.length/h)&&P(e)};return te?o.jsxs(Re,{children:[o.jsx("h1",{children:"Mantenimiento Edificios"}),o.jsxs("div",{className:"d-flex justify-content-end mb-3",children:[o.jsx(c,{style:{backgroundColor:"#4B6251",color:"white",marginRight:"10px"},onClick:()=>{v(!0),x(!1)},children:"+ Nuevo"}),o.jsxs(Me,{children:[o.jsx(ze,{style:{backgroundColor:"#6C8E58",color:"white"},children:"Reporte"}),o.jsxs(Ue,{children:[o.jsx(oe,{onClick:Ce,style:{color:"#6C8E58",fontWeight:"bold"},children:"Descargar en Excel"}),o.jsx(oe,{onClick:je,style:{color:"#6C8E58",fontWeight:"bold"},children:"Ver Reporte en PDF"})]})]})]}),o.jsxs("div",{className:"d-flex justify-content-between align-items-center mb-3",children:[o.jsxs(Ve,{style:{maxWidth:"400px"},children:[o.jsx(Be,{children:"Buscar"}),o.jsx(u,{placeholder:"Buscar por nombre",onChange:_e,value:q}),o.jsx(c,{style:{backgroundColor:"#cccccc",color:"black"},onClick:()=>{Y(""),P(1)},children:"Limpiar"})]}),o.jsxs("div",{className:"d-flex align-items-center",children:[o.jsx("label",{htmlFor:"recordsPerPageSelect",className:"mr-2",children:"Mostrar"}),o.jsxs("select",{id:"recordsPerPageSelect",value:h,onChange:e=>{pe(Number(e.target.value)),P(1)},children:[o.jsx("option",{value:5,children:"5"}),o.jsx("option",{value:10,children:"10"}),o.jsx("option",{value:15,children:"15"}),o.jsx("option",{value:20,children:"20"})]}),o.jsx("span",{style:{marginLeft:"10px"},children:"registros"})]})]}),o.jsx("div",{style:{height:"300px",overflowY:"scroll",border:"1px solid #ccc",padding:"10px",marginBottom:"30px"},children:o.jsxs(Fe,{striped:!0,children:[o.jsx(We,{children:o.jsxs(se,{children:[o.jsx(y,{className:"text-center",style:{width:"5%"},children:"#"}),o.jsx(y,{style:{width:"40%"},children:"Nombre del Edificio"}),o.jsx(y,{className:"text-center",style:{width:"20%"},children:"Número de Pisos"}),o.jsx(y,{className:"text-center",style:{width:"20%"},children:"Aulas Integradas"}),o.jsx(y,{className:"text-center",style:{width:"15%"},children:"Acciones"})]})}),o.jsx($e,{children:Ee.map(e=>o.jsxs(se,{children:[o.jsx(_,{className:"text-center",children:e.originalIndex}),o.jsx(_,{style:{textTransform:"uppercase"},children:e.Nombre_edificios}),o.jsx(_,{className:"text-center",children:e.Numero_pisos}),o.jsx(_,{className:"text-center",children:e.Aulas_disponibles}),o.jsx(_,{className:"text-center",children:o.jsxs("div",{className:"d-flex justify-content-center",children:[ae&&o.jsx(c,{color:"warning",onClick:()=>Ne(e),style:{marginRight:"10px"},children:o.jsx(ee,{icon:He})}),re&&o.jsx(c,{color:"danger",onClick:()=>ye(e),children:o.jsx(ee,{icon:Oe})})]})})]},e.Cod_edificio))})]})}),o.jsx(Ge,{align:"center","aria-label":"Page navigation example",activePage:f,pages:Math.ceil(j.length/h),onActivePageChange:z}),o.jsxs("div",{className:"d-flex justify-content-center align-items-center mt-3",children:[o.jsx(c,{style:{backgroundColor:"#6f8173",color:"#D9EAD3"},disabled:f===1,onClick:()=>z(f-1),children:"Anterior"}),o.jsx(c,{style:{marginLeft:"10px",backgroundColor:"#6f8173",color:"#D9EAD3"},disabled:f===Math.ceil(j.length/h),onClick:()=>z(f+1),children:"Siguiente"}),o.jsxs("div",{style:{marginLeft:"10px"},children:["Página ",f," de ",Math.ceil(j.length/h)]})]}),o.jsxs(B,{visible:le,onClose:()=>D(v,R),backdrop:"static",children:[o.jsx(F,{children:o.jsx(H,{children:"Ingresar edificio"})}),o.jsx(W,{children:o.jsxs(ie,{children:[o.jsx(u,{label:"Nombre del edificio",value:d.Nombre_edificios,maxLength:50,style:{textTransform:"uppercase"},onPaste:l,onCopy:l,onChange:e=>Z(e,T)}),o.jsx(u,{label:"Número de pisos",type:"number",value:d.Numero_pisos,maxLength:2,onPaste:l,onCopy:l,onChange:e=>{const s=e.target.value.slice(0,3);T({...d,Numero_pisos:s}),I("Numero_pisos",s)}}),r.Numero_pisos&&o.jsx("p",{className:"text-danger",children:r.Numero_pisos}),o.jsx(u,{label:"Aulas integradas",type:"number",value:d.Aulas_disponibles,maxLength:3,onPaste:l,onCopy:l,onChange:e=>be(e,T)}),r.pisosVsAulas&&o.jsx("p",{className:"text-warning",children:r.pisosVsAulas}),r.Aulas_disponibles&&o.jsx("p",{className:"text-danger",children:r.Aulas_disponibles})]})}),o.jsxs($,{children:[o.jsx(c,{color:"secondary",onClick:()=>D(v,R),children:"Cancelar"}),o.jsx(c,{style:{backgroundColor:"#4B6251",color:"white"},onClick:ue,disabled:r.Numero_pisos||r.Aulas_disponibles,children:"Guardar"})]})]}),o.jsxs(B,{visible:ce,onClose:()=>D(A,M),backdrop:"static",children:[o.jsx(F,{children:o.jsx(H,{children:"Actualizar edificio"})}),o.jsx(W,{children:o.jsxs(ie,{children:[o.jsx(u,{label:"Identificador",value:p.Cod_edificio,readOnly:!0}),o.jsx(u,{label:"Nombre del Edificio",value:p.Nombre_edificios,maxLength:50,style:{textTransform:"uppercase"},onPaste:l,onCopy:l,onChange:e=>Z(e,C)}),o.jsx(u,{label:"Número de Pisos",type:"number",value:p.Numero_pisos,maxLength:2,onPaste:l,onCopy:l,onChange:e=>{const s=e.target.value.slice(0,3);C({...p,Numero_pisos:s}),I("Numero_pisos",s)}}),r.Numero_pisos&&o.jsx("p",{className:"text-danger",children:r.Numero_pisos}),o.jsx(u,{label:"Aulas Integradas",type:"number",value:p.Aulas_disponibles,maxLength:2,onPaste:l,onCopy:l,onChange:e=>{const s=e.target.value.slice(0,3);C({...p,Aulas_disponibles:s}),I("Aulas_disponibles",s)}}),r.pisosVsAulas&&o.jsx("p",{className:"text-warning",children:r.pisosVsAulas}),r.Aulas_disponibles&&o.jsx("p",{className:"text-danger",children:r.Aulas_disponibles})]})}),o.jsxs($,{children:[o.jsx(c,{color:"secondary",onClick:()=>D(A,M),children:"Cancelar"}),o.jsx(c,{style:{backgroundColor:"#4B6251",color:"white"},onClick:fe,disabled:r.Numero_pisos||r.Aulas_disponibles,children:"Guardar"})]})]}),o.jsxs(B,{visible:de,onClose:()=>S(!1),backdrop:"static",children:[o.jsx(F,{children:o.jsx(H,{children:"Eliminar edificio"})}),o.jsxs(W,{children:['¿Estás seguro de que deseas eliminar el edificio "',O.Nombre_edificios,'"?']}),o.jsxs($,{children:[o.jsx(c,{color:"secondary",onClick:()=>S(!1),children:"Cancelar"}),o.jsx(c,{color:"danger",onClick:he,children:"Eliminar"})]})]})]}):o.jsx(Ie,{})};export{wo as default};
