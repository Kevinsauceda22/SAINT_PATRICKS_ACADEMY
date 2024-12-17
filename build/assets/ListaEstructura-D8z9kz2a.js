import{r as i,u as rr,o as ar,j as e,i as tr}from"./index-SVRFFNc9.js";import{C as y}from"./index.esm-DWwMdKxH.js";import{S as j}from"./sweetalert2.esm.all-D3pEHXw3.js";import{E as or}from"./jspdf.plugin.autotable-gke1D7B3.js";import{u as ee,w as sr}from"./xlsx-lwdk4T0U.js";import"./FileSaver.min-DN8zk8MP.js";import{l as ir}from"./logo_saint_patrick-xw7Wl8f3.js";import{u as nr}from"./usePermission-BCWksQX7.js";import cr from"./AccessDenied-yaDW3Jao.js";import{C as lr}from"./CContainer-BdNP0s3v.js";import{C as dr,a as Ne}from"./CRow-Bf67u6lu.js";import{a as l}from"./CButton-D9GPTbB6.js";import{c as pr}from"./cil-arrow-left-D66Kb3Zq.js";import{c as ur}from"./cil-plus-D8mtC-W5.js";import{C as mr,a as hr,b as xr,c as ye}from"./CDropdownToggle-DlfIUTmX.js";import{C as D}from"./CInputGroup-D-McUFva.js";import{C as P}from"./CInputGroupText-Cfu0fzaY.js";import{C as z}from"./CFormInput-B_gylY64.js";import{C as fr,a as gr,b as re,c as w,d as _r,e as E}from"./CTable-98qqrSRH.js";import{c as we}from"./cil-pen-53d2I-C-.js";import{c as Cr}from"./cil-trash-CBbKHhHb.js";import{C as jr}from"./CPagination-UopCEeNZ.js";import{C as ae,a as te,b as oe,c as se}from"./CModalHeader-Bhtr3bZe.js";import{C as ie}from"./CModalTitle-M2mBvD_5.js";import{C as Se}from"./CForm-CYRkMwLo.js";import{c as ve}from"./cil-search-CDkY_4k-.js";import{C as Te}from"./CFormSelect-CzT7g5tb.js";import{c as br}from"./cil-save-CHBg7z_U.js";import"./CConditionalPortal-DwBsYzTA.js";import"./CFormControlWrapper-OEJgTi6e.js";import"./CFormControlValidation-CtDkyDfm.js";import"./CFormLabel-szm2Dda9.js";import"./CBackdrop-BbuVwMMD.js";const na=()=>{var xe,fe,ge,_e,Ce,je;const{canSelect:De,canDelete:Pe,canInsert:Er,canUpdate:Fe}=nr("ListaEstructura"),[Nr,Re]=i.useState([]),[I,B]=i.useState(!1),[q,M]=i.useState(!1),[G,O]=i.useState(!1),[x,W]=i.useState({cod_persona_padre:"",cod_persona_estudiante:"",cod_tipo_relacion:"",descripcion:""}),[S,F]=i.useState({}),[J,H]=i.useState({}),[Ue,ne]=i.useState({}),[c,Ae]=i.useState([]),[K,X]=i.useState([]),[R,ke]=i.useState([]),[U,A]=i.useState(""),[ce,L]=i.useState(!1),[f,Ie]=i.useState(""),[le,de]=i.useState(""),[N,pe]=i.useState(1),[k,Le]=i.useState(10),[$e,yr]=i.useState(""),[ze,wr]=i.useState(""),[Sr,ue]=i.useState(!1),[Z,v]=i.useState([]),[vr,Be]=i.useState("");i.useState([]),i.useState("");const Me=()=>{Oe("/ListaPersonas")},Q=rr(),Oe=ar(),{personaSeleccionada:o}=(Q==null?void 0:Q.state)||{};i.useEffect(()=>{o&&Ie(o.cod_tipo_persona===1?"ESTUDIANTE":"PADRE")},[o]),i.useEffect(()=>{o&&(async()=>{const t=await(await fetch(`http://74.50.68.87:4000/api/estructuraFamiliar/verEstructurasFamiliares/${o.cod_persona}`)).json();v(t)})()},[o]),i.useEffect(()=>{q===!1&&o&&(async()=>{const t=await(await fetch(`http://74.50.68.87:4000/api/estructuraFamiliar/verEstructuraFamiliar/${o.cod_persona}`)).json();Array.isArray(t)?v(t):v([])})()},[q,o]),i.useEffect(()=>{I===!1&&o&&(async()=>{const t=await(await fetch(`http://74.50.68.87:4000/api/estructuraFamiliar/verEstructuraFamiliar/${o.cod_persona}`)).json();Array.isArray(t)?v(t):v([])})()},[I,o]),i.useEffect(()=>{G===!1&&o&&(async()=>{const t=await(await fetch(`http://74.50.68.87:4000/api/estructuraFamiliar/verEstructuraFamiliar/${o.cod_persona}`)).json();Array.isArray(t)?v(t):v([])})()},[G,o]),i.useEffect(()=>{(async()=>{const t=await(await fetch("http://74.50.68.87:4000/api/estructuraFamiliar/verPersonas")).json();Ae(t)})()},[]),i.useEffect(()=>{const r=c.filter(a=>{var t,s;return((t=a.fullName)==null?void 0:t.toUpperCase().includes(U.toUpperCase()))||((s=a.dni_persona)==null?void 0:s.includes(U))});X(r),L(U.length>0&&r.length>0)},[U,c]);const We=r=>{const a=r.target.value.toLowerCase();if(A(a),a.trim()===""){X([]),L(!1);return}const t=c.filter(s=>s.fullName&&s.fullName.toLowerCase().includes(a)||s.dni_persona&&s.dni_persona.includes(a));X(t),L(t.length>0)},He=r=>{Be(r.cod_persona),A(`${r.dni_persona} - ${r.fullName}`),W(a=>({...a,[f==="ESTUDIANTE"?"cod_persona_padre":"cod_persona_estudiante"]:r.cod_persona})),L(!1)},me=()=>{W({cod_persona_padre:f==="PADRE"&&(o==null?void 0:o.cod_persona)||"",cod_persona_estudiante:f==="ESTUDIANTE"&&(o==null?void 0:o.cod_persona)||"",cod_tipo_relacion:"",descripcion:""}),A("")},Ke=()=>{F({cod_persona_padre:f==="PADRE"&&(o==null?void 0:o.cod_persona)||"",cod_persona_estudiante:f==="ESTUDIANTE"&&(o==null?void 0:o.cod_persona)||"",cod_tipo_relacion:"",descripcion:""}),A("")};i.useEffect(()=>{I&&me()},[I]),i.useEffect(()=>{(async()=>{try{const a=await tr.get("http://74.50.68.87:4000/api/estructuraFamiliar/verTipoRelacion");ke(a.data),console.log("Datos de tipo Relacion:",a.data)}catch(a){console.error("Error al cargar tipos de relación:",a)}})()},[]);const V=async()=>{try{const a=await(await fetch("http://74.50.68.87:4000/api/estructuraFamiliar/verEstructuraFamiliar")).json();if(console.log(a),Array.isArray(a)){const t=a.map((s,_)=>({...s,originalIndex:_+1}));console.log(t),Re(t)}else console.error("La respuesta no es un array:",a)}catch(r){console.error("Error al obtener la estructura familiar:",r)}},Ve=async()=>{if(console.log("Estructura familiar final:",x),!x.descripcion.trim()){j.fire({icon:"warning",title:"Campo obligatorio",text:"La descripción no puede estar vacía."});return}if(!x.cod_persona_padre&&!x.cod_persona_estudiante){j.fire({icon:"warning",title:"Campos obligatorios",text:"Debe seleccionar al menos un padre o estudiante."});return}console.log("Datos enviados al backend:",x);try{const r={cod_persona_padre:x.cod_persona_padre,cod_persona_estudiante:x.cod_persona_estudiante,cod_tipo_relacion:x.cod_tipo_relacion,descripcion:x.descripcion},a=await fetch("http://74.50.68.87:4000/api/estructuraFamiliar/crearEstructuraFamiliar",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)});if(a.ok)V(),B(!1),me(),ue(!1),j.fire({icon:"success",title:"Creación exitosa",text:"La estructura ha sido creada correctamente."});else{const t=await a.json();j.fire({icon:"error",title:"Error al crear",text:t.message||"No se pudo crear la estructura."})}}catch(r){console.error("Error al crear la estructura:",r),j.fire({icon:"error",title:"Error de conexión",text:"Hubo un problema al conectar con el servidor."})}},Ye=async()=>{try{const r=await fetch(`http://74.50.68.87:4000/api/estructuraFamiliar/actualizarEstructuraFamiliar/${S.Cod_genealogia}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({descripcion:S.descripcion,cod_persona_padre:S.cod_persona_padre,cod_persona_estudiante:S.cod_persona_estudiante,cod_tipo_relacion:S.cod_tipo_relacion})});if(r.ok)V(),M(!1),Ke(),ue(!1),j.fire({icon:"success",title:"Actualización exitosa",text:"La estructura familiar ha sido actualizada correctamente."});else{const a=await r.text();j.fire({icon:"error",title:"Error",text:`No se pudo actualizar la estructura familiar: ${a}`})}}catch(r){console.error("Error al actualizar la estructura familiar:",r),j.fire({icon:"error",title:"Error inesperado",text:"Ocurrió un error al intentar actualizar la estructura familiar."})}};i.useEffect(()=>{V()},[]);const qe=async()=>{try{(await fetch(`http://74.50.68.87:4000/api/estructuraFamiliar/eliminarEstructuraFamiliar/${encodeURIComponent(Ue.Cod_genealogia)}`,{method:"DELETE",headers:{"Content-Type":"application/json"}})).ok?(V(),O(!1),ne({}),j.fire({icon:"success",title:"Eliminación exitosa",text:"La estructura familiar ha sido eliminado correctamente."})):j.fire({icon:"error",title:"Error",text:"No se pudo eliminar la estructura familiar."})}catch(r){console.error("Error al eliminar la estructura familiar:",r)}},Ge=r=>{var a,t;F({...r,descripcion:r.descripcion||"",cod_persona_padre:r.cod_persona_padre||"",cod_persona_estudiante:r.cod_persona_estudiante||"",cod_tipo_relacion:r.cod_tipo_relacion||"",Cod_genealogia:r.Cod_genealogia||"",nombreEstudiante:((a=c.find(s=>s.cod_persona===r.cod_persona_estudiante))==null?void 0:a.fullName)||"",nombrePadre:((t=c.find(s=>s.cod_persona===r.cod_persona_padre))==null?void 0:t.fullName)||""}),M(!0)},Je=r=>{ne(r),O(!0)},Xe=()=>{B(!0)},T=Z.filter(r=>{var g,b,d,h,u,p,n;const a=((b=(g=c.find(C=>C.cod_persona===r.cod_persona_estudiante))==null?void 0:g.fullName)==null?void 0:b.toUpperCase())||"N/A",t=((h=(d=c.find(C=>C.cod_persona===r.cod_persona_padre))==null?void 0:d.fullName)==null?void 0:h.toUpperCase())||"N/A",s=((p=(u=R.find(C=>C.Cod_tipo_relacion===r.cod_tipo_relacion))==null?void 0:u.tipo_relacion)==null?void 0:p.toUpperCase())||"N/A",_=((n=r.descripcion)==null?void 0:n.toUpperCase())||"N/A",m=le.toUpperCase();return a.includes(m)||t.includes(m)||s.includes(m)||_.includes(m)}),he=T.slice((N-1)*k,N*k),Ze=r=>{const a=r.target.value;de(a)},Qe=()=>{const r=new or("l  ","mm","letter");if(!T||T.length===0){alert("No hay datos para exportar.");return}const a=new Image;a.src=ir,a.onload=()=>{const t=r.internal.pageSize.width;r.addImage(a,"PNG",10,10,45,45),r.setFontSize(18),r.setTextColor(0,102,51),r.text("SAINT PATRICK'S ACADEMY",t/2,24,{align:"center"}),r.setFontSize(10),r.setTextColor(100),r.text("Casa Club del periodista, Colonia del Periodista",t/2,32,{align:"center"}),r.text("Teléfono: (504) 2234-8871",t/2,37,{align:"center"}),r.text("Correo: info@saintpatrickacademy.edu",t/2,42,{align:"center"}),r.setFontSize(14),r.setTextColor(0,102,51),r.text("Reporte de Estructura Familiar",t/2,50,{align:"center"}),r.setLineWidth(.5),r.setDrawColor(0,102,51),r.line(10,60,t-10,60);const s=T.map((d,h)=>{var u,p,n,C,Y,be,Ee;return{index:(h+1).toString(),estudiante:((p=(u=c.find($=>$.cod_persona===d.cod_persona_estudiante))==null?void 0:u.fullName)==null?void 0:p.toUpperCase())||"N/D",padre:((C=(n=c.find($=>$.cod_persona===d.cod_persona_padre))==null?void 0:n.fullName)==null?void 0:C.toUpperCase())||"N/D",tipo_relacion:((be=(Y=R.find($=>$.Cod_tipo_relacion===d.cod_tipo_relacion))==null?void 0:Y.tipo_relacion)==null?void 0:be.toUpperCase())||"N/D",descripcion:((Ee=d.descripcion)==null?void 0:Ee.toUpperCase())||"N/D"}}),_=r.internal.pageSize.height;r.autoTable({startY:65,startY:(_-s.length*10)/2,columns:[{header:"#",dataKey:"index"},{header:"Estudiante",dataKey:"estudiante"},{header:"Padre/Tutor",dataKey:"padre"},{header:"Tipo de Relación",dataKey:"tipo_relacion"},{header:"Descripción",dataKey:"descripcion"}],body:s,headStyles:{fillColor:[0,102,51],textColor:[255,255,255],fontSize:9,halign:"center"},styles:{fontSize:7,cellPadding:4},columnStyles:{index:{cellWidth:10},estudiante:{cellWidth:75},padre:{cellWidth:75},tipo_relacion:{cellWidth:40},descripcion:{cellWidth:60}},alternateRowStyles:{fillColor:[240,248,255]},didDrawPage:d=>{const h=r.internal.getNumberOfPages(),u=r.internal.getCurrentPageInfo().pageNumber,p=r.internal.pageSize.height-10;r.setFontSize(10),r.setTextColor(0,102,51),r.text(`Página ${u} de ${h}`,t-10,p,{align:"right"});const n=new Date,C=n.toLocaleDateString("es-HN",{year:"numeric",month:"long",day:"numeric"}),Y=n.toLocaleTimeString("es-HN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});r.text(`Fecha de generación: ${C} Hora: ${Y}`,10,p)}});const m=r.output("blob"),g=URL.createObjectURL(m);window.open("","_blank").document.write(`
      <html>
        <head><title>Reporte de Estructura Familiar</title></head>
        <body style="margin:0;">
          <iframe width="100%" height="100%" src="${g}" frameborder="0"></iframe>
          <div style="position:fixed;top:10px;right:20px;">
            <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
              onclick="const a = document.createElement('a'); a.href='${g}'; a.download='Reporte_Estructura_Familiar.pdf'; a.click();">
              Descargar PDF
            </button>
            <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
              onclick="window.print();">
              Imprimir PDF
            </button>
          </div>
        </body>
      </html>`)},a.onerror=()=>{alert("No se pudo cargar el logo.")}},er=()=>{if(!T||T.length===0){alert("No hay datos para exportar.");return}const r=T.map((s,_)=>{var m,g,b,d,h,u,p;return{"#":(_+1).toString(),Estudiante:((g=(m=c.find(n=>n.cod_persona===s.cod_persona_estudiante))==null?void 0:m.fullName)==null?void 0:g.toUpperCase())||"N/D","Padre/Tutor":((d=(b=c.find(n=>n.cod_persona===s.cod_persona_padre))==null?void 0:b.fullName)==null?void 0:d.toUpperCase())||"N/D","Tipo de Relación":((u=(h=R.find(n=>n.Cod_tipo_relacion===s.cod_tipo_relacion))==null?void 0:h.tipo_relacion)==null?void 0:u.toUpperCase())||"N/D",Descripción:((p=s.descripcion)==null?void 0:p.toUpperCase())||"N/D"}}),a=ee.json_to_sheet(r),t=ee.book_new();ee.book_append_sheet(t,a,"Reporte Estructura Familiar"),sr(t,"Reporte_Estructura_Familiar.xlsx")};return De?e.jsxs(lr,{children:[e.jsxs(dr,{className:"align-items-center mb-5",children:[e.jsxs(Ne,{xs:"8",md:"9",children:[e.jsx("h1",{className:"mb-0",children:"Estructura Familiar"}),o?e.jsxs("div",{style:{marginTop:"10px",fontSize:"16px",color:"#555"},children:[e.jsx("strong",{children:"RELACIONES DE:"})," ",o?`${o.Nombre.toUpperCase()} ${((xe=o.Segundo_nombre)==null?void 0:xe.toUpperCase())||""} ${o.Primer_apellido.toUpperCase()} ${((fe=o.Segundo_apellido)==null?void 0:fe.toUpperCase())||""}`:"Información no disponible"]}):e.jsxs("div",{style:{marginTop:"10px",fontSize:"16px",color:"#555"},children:[e.jsx("strong",{children:"Persona Seleccionada:"})," Información no disponible"]})]}),e.jsxs(Ne,{xs:"4",md:"3",className:"text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center",children:[e.jsxs(l,{color:"secondary",onClick:Me,style:{marginRight:"10px",minWidth:"120px"},children:[e.jsx(y,{icon:pr})," Personas"]}),e.jsxs(l,{style:{backgroundColor:"#4B6251",color:"white",minWidth:"120px"},className:"mb-3 mb-md-0 me-md-3",onClick:Xe,children:[e.jsx(y,{icon:ur})," Nuevo"]}),e.jsxs(mr,{children:[e.jsx(hr,{style:{backgroundColor:"#6C8E58",color:"white"},children:"Reporte"}),e.jsxs(xr,{children:[e.jsx(ye,{onClick:Qe,children:"Descargar en PDF"}),e.jsx(ye,{onClick:er,children:"Descargar en Excel"})]})]})]})]}),e.jsxs("div",{className:"d-flex justify-content-between align-items-center mb-3",children:[e.jsxs(D,{style:{maxWidth:"400px"},children:[e.jsx(P,{children:"Buscar"}),e.jsx(z,{placeholder:"Buscar",onChange:Ze,value:le}),e.jsx(l,{style:{backgroundColor:"#cccccc",color:"black"},onClick:()=>{de(""),pe(1)},children:"Limpiar"})]}),e.jsxs("div",{className:"d-flex align-items-center",children:[e.jsx("label",{htmlFor:"recordsPerPageSelect",className:"mr-2",children:"Mostrar"}),e.jsxs("select",{id:"recordsPerPageSelect",value:k,onChange:r=>{Le(Number(r.target.value)),pe(1)},children:[e.jsx("option",{value:5,children:"5"}),e.jsx("option",{value:10,children:"10"}),e.jsx("option",{value:15,children:"15"}),e.jsx("option",{value:20,children:"20"})]}),e.jsx("span",{style:{marginLeft:"10px"},children:"registros"})]})]}),e.jsx("div",{className:"table-container",children:e.jsx("div",{style:{overflowX:"auto",overflowY:"auto",maxHeight:"500px"},children:e.jsxs(fr,{striped:!0,children:[e.jsx(gr,{children:e.jsxs(re,{children:[e.jsx(w,{style:{borderRight:"1px solid #ddd"},className:"text-center",children:"#"}),f==="ESTUDIANTE"?e.jsxs(e.Fragment,{children:[e.jsx(w,{style:{borderRight:"1px solid #ddd"},className:"text-center",children:"Estudiante"}),e.jsx(w,{style:{borderRight:"1px solid #ddd"},className:"text-center",children:"Padre/Tutor"})]}):e.jsxs(e.Fragment,{children:[e.jsx(w,{style:{borderRight:"1px solid #ddd"},className:"text-center",children:"Padre/Tutor"}),e.jsx(w,{style:{borderRight:"1px solid #ddd"},className:"text-center",children:"Estudiante"})]}),e.jsx(w,{style:{borderRight:"1px solid #ddd"},className:"text-center",children:"Tipo Relación"}),e.jsx(w,{style:{borderRight:"1px solid #ddd"},className:"text-center",children:"Descripción"}),e.jsx(w,{className:"text-center",children:"Acciones"})]})}),e.jsx(_r,{children:he.length>0?he.map((r,a)=>{var t,s,_,m,g,b,d,h,u,p;return e.jsxs(re,{children:[e.jsx(E,{style:{borderRight:"1px solid #ddd"},className:"text-center",children:(N-1)*k+a+1}),f==="ESTUDIANTE"?e.jsxs(e.Fragment,{children:[e.jsx(E,{style:{borderRight:"1px solid #ddd"},className:"text-center",children:((s=(t=c.find(n=>n.cod_persona===r.cod_persona_estudiante))==null?void 0:t.fullName)==null?void 0:s.toUpperCase())||"N/A"}),e.jsx(E,{style:{borderRight:"1px solid #ddd"},className:"text-center",children:((m=(_=c.find(n=>n.cod_persona===r.cod_persona_padre))==null?void 0:_.fullName)==null?void 0:m.toUpperCase())||"N/A"})]}):e.jsxs(e.Fragment,{children:[e.jsx(E,{style:{borderRight:"1px solid #ddd"},className:"text-center",children:((b=(g=c.find(n=>n.cod_persona===r.cod_persona_padre))==null?void 0:g.fullName)==null?void 0:b.toUpperCase())||"N/A"}),e.jsx(E,{style:{borderRight:"1px solid #ddd"},className:"text-center",children:((h=(d=c.find(n=>n.cod_persona===r.cod_persona_estudiante))==null?void 0:d.fullName)==null?void 0:h.toUpperCase())||"N/A"})]}),e.jsx(E,{style:{borderRight:"1px solid #ddd"},className:"text-center",children:((p=(u=R.find(n=>n.Cod_tipo_relacion===r.cod_tipo_relacion))==null?void 0:u.tipo_relacion)==null?void 0:p.toUpperCase())||"N/A"}),e.jsx(E,{style:{borderRight:"1px solid #ddd"},className:"text-center",children:r.descripcion.toUpperCase()}),e.jsx(E,{className:"text-center",children:e.jsxs("div",{className:"d-flex justify-content-center",children:[Fe&&e.jsx(l,{color:"warning",onClick:()=>Ge(r),style:{marginRight:"10px"},children:e.jsx(y,{icon:we})}),Pe&&e.jsx(l,{color:"danger",onClick:()=>Je(r),children:e.jsx(y,{icon:Cr})})]})})]},r.cod_estructura)}):e.jsx(re,{children:e.jsx(E,{colSpan:"6",className:"text-center",children:"No hay estructuras familiares para esta persona."})})})]})})}),e.jsxs("div",{className:"pagination-container",style:{display:"flex",justifyContent:"center",alignItems:"center"},children:[e.jsxs(jr,{"aria-label":"Page navigation",children:[e.jsx(l,{style:{backgroundColor:"#6f8173",color:"#D9EAD3"},disabled:N===1,onClick:()=>paginate(N-1),children:"Anterior"}),e.jsx(l,{style:{marginLeft:"10px",backgroundColor:"#6f8173",color:"#D9EAD3"},disabled:N===Math.ceil(Z.length/k),onClick:()=>paginate(N+1),children:"Siguiente"})]}),e.jsxs("span",{style:{marginLeft:"10px"},children:["Página ",N," de ",Math.ceil(Z.length/k)]})]}),e.jsxs(ae,{visible:I,onClose:()=>B(!1),backdrop:"static",children:[e.jsx(te,{closeButton:!0,children:e.jsx(ie,{children:"Nueva Estructura Familiar"})}),e.jsxs(oe,{children:[e.jsxs("div",{style:{marginBottom:"10px",border:"1px solid #dcdcdc",padding:"10px",backgroundColor:"#f9f9f9"},children:[e.jsx("strong",{children:"PERSONA:"})," ",o?`${o.Nombre.toUpperCase()} ${((ge=o.Segundo_nombre)==null?void 0:ge.toUpperCase())||""} ${o.Primer_apellido.toUpperCase()} ${((_e=o.Segundo_apellido)==null?void 0:_e.toUpperCase())||""}`:"Información no disponible"]}),e.jsxs(Se,{children:[e.jsx("input",{type:"hidden",name:"cod_persona_estudiante",value:$e}),e.jsx("input",{type:"hidden",name:"cod_persona_padre",value:ze}),e.jsxs("div",{className:"mb-3",children:[e.jsxs(D,{className:"mb-3",children:[e.jsx(P,{children:f==="ESTUDIANTE"?"Padre/Tutor":"Estudiante"}),e.jsx(z,{type:"text",value:U,onChange:We,placeholder:`Buscar por DNI o nombre (${f==="ESTUDIANTE"?"Padre/Tutor":"Estudiante"})`}),e.jsx(l,{type:"button",children:e.jsx(y,{icon:ve})})]}),ce&&K.length>0&&e.jsx("div",{className:"dropdown-menu show",style:{position:"absolute",zIndex:999,top:"100%",left:0,width:"100%"},children:K.map(r=>e.jsxs("div",{className:"dropdown-item",style:{cursor:"pointer"},onClick:()=>He(r),children:[r.dni_persona," - ",r.fullName]},r.cod_persona))})]}),e.jsxs(D,{className:"mt-3",children:[e.jsx(P,{children:"Tipo Relación"}),e.jsxs(Te,{value:x.cod_tipo_relacion,onChange:r=>W(a=>({...a,cod_tipo_relacion:r.target.value})),children:[e.jsx("option",{value:"",children:"Tipo de Relación"}),R.map(r=>e.jsx("option",{value:r.Cod_tipo_relacion,children:r.tipo_relacion.toUpperCase()},r.Cod_tipo_relacion))]})]}),e.jsxs(D,{className:"mt-3",children:[e.jsx(P,{children:"Descripción"}),e.jsx(z,{type:"text",value:x.descripcion,onChange:r=>{const a=r.target.value.toUpperCase();if(/(.)\1{2,}/.test(a)){H(s=>({...s,descripcion:"La descripción no puede contener más de tres letras repetidas consecutivas."}));return}if(/[^A-Za-záéíóúÁÉÍÓÚñÑ0-9\s\-.,]/.test(a)){H(s=>({...s,descripcion:"La descripción solo puede contener letras, números, acentos, espacios, guiones y puntos."}));return}if(/\s{2,}/.test(a)){H(s=>({...s,descripcion:"La descripción no puede contener más de un espacio consecutivo."}));return}const t={...J};a.trim()?a.length<2?t.descripcion="La descripción debe tener al menos 2 caracteres.":t.descripcion="":t.descripcion="La descripción no puede estar vacía.",W(s=>({...s,descripcion:a})),H(t)},placeholder:"Descripción de la relación",required:!0})]}),J.descripcion&&e.jsx("div",{className:"error-message",style:{marginBottom:"10px",color:"red",fontSize:"0.850rem"},children:J.descripcion}),e.jsx("style",{jsx:!0,children:`
  .error-message {
    color: red;
    font-size: 12px;  /* Tamaño de texto más pequeño */
    margin-top: 4px;  /* Menor distancia entre el input y el mensaje de error */
    margin-bottom: 0;
    margin-left: 12px;  /* Para alinearlo con el texto del input */
  }
`})]})]}),e.jsxs(se,{children:[e.jsx(l,{style:{backgroundColor:"#6c757d",color:"white",borderColor:"#6c757d"},onClick:()=>B(!1),children:"Cancelar"}),e.jsxs(l,{style:{backgroundColor:"#4B6251",color:"white",borderColor:"#4B6251"},onClick:Ve,children:[e.jsx(y,{icon:br})," Guardar"]})]})]}),e.jsxs(ae,{visible:q,onClose:()=>M(!1),backdrop:"static",children:[e.jsx(te,{closeButton:!0,children:e.jsx(ie,{children:"Actualizar Estructura Familiar"})}),e.jsxs(oe,{children:[e.jsxs("div",{style:{marginBottom:"10px",border:"1px solid #dcdcdc",padding:"10px",backgroundColor:"#f9f9f9"},children:[e.jsx("strong",{children:"PERSONA:"})," ",o?`${o.Nombre.toUpperCase()} ${((Ce=o.Segundo_nombre)==null?void 0:Ce.toUpperCase())||""} ${o.Primer_apellido.toUpperCase()} ${((je=o.Segundo_apellido)==null?void 0:je.toUpperCase())||""}`:"Información no disponible"]}),e.jsxs(Se,{children:[e.jsx("input",{type:"hidden",name:"cod_persona",value:o==null?void 0:o.cod_persona}),e.jsxs("div",{className:"mb-3",children:[e.jsxs(D,{className:"mb-3",children:[e.jsx(P,{children:f==="ESTUDIANTE"?"Padre/Tutor":"Estudiante"}),e.jsx(z,{type:"text",value:U,onChange:r=>A(r.target.value),placeholder:"Buscar por DNI o nombre"}),e.jsx(l,{type:"button",children:e.jsx(y,{icon:ve})})]}),ce&&K.length>0&&e.jsx("div",{className:"dropdown-menu show",style:{position:"absolute",zIndex:999,top:"100%",left:0,width:"100%"},children:K.map(r=>e.jsxs("div",{className:"dropdown-item",style:{cursor:"pointer"},onClick:()=>{const a=[r.Nombre,r.Segundo_nombre,r.Primer_apellido,r.Segundo_apellido].filter(Boolean).join(" ");F(f==="ESTUDIANTE"?t=>({...t,cod_persona_padre:r.cod_persona}):t=>({...t,cod_persona_estudiante:r.cod_persona})),A(a),L(!1)},children:[r.dni_persona," - ",r.fullName]},r.cod_persona))})]}),e.jsxs(D,{className:"mt-3",children:[e.jsx(P,{children:"Tipo Relación"}),e.jsxs(Te,{value:S.cod_tipo_relacion,onChange:r=>F(a=>({...a,cod_tipo_relacion:r.target.value})),children:[e.jsx("option",{value:"",children:"Tipo de Relación"}),R.map(r=>e.jsx("option",{value:r.Cod_tipo_relacion,children:r.tipo_relacion.toUpperCase()},r.Cod_tipo_relacion))]})]}),e.jsxs(D,{className:"mt-3",children:[e.jsx(P,{children:"Descripción"}),e.jsx(z,{type:"text",value:S.descripcion,onChange:r=>F(a=>({...a,descripcion:r.target.value.toUpperCase()})),placeholder:"Descripción de la relación",required:!0})]})]})]}),e.jsxs(se,{children:[e.jsx(l,{style:{backgroundColor:"#6c757d",color:"white",borderColor:"#6c757d"},onClick:()=>M(!1),children:"Cancelar"}),e.jsxs(l,{style:{backgroundColor:"#4B6251",color:"white",borderColor:"#4B6251"},onClick:Ye,children:[e.jsx(y,{icon:we})," Actualizar"]})]})]}),e.jsxs(ae,{visible:G,onClose:()=>O(!1),backdrop:"static",children:[e.jsx(te,{children:e.jsx(ie,{children:"Eliminar Estructura Familiar"})}),e.jsx(oe,{children:"¿Estás seguro de que deseas eliminar la estructura familiar?"}),e.jsxs(se,{children:[e.jsx(l,{color:"secondary",onClick:()=>O(!1),children:"Cancelar"}),e.jsx(l,{color:"danger",onClick:qe,children:"Eliminar"})]})]})]}):e.jsx(cr,{})};export{na as default};
