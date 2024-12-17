import{R as r,j as n}from"./index-SVRFFNc9.js";const s=()=>{const t={container:{height:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",background:"#ffffff",fontFamily:"Arial, sans-serif",color:"#333333",margin:0,padding:0},icon:{width:"100px",height:"100px",background:"#ff4444",borderRadius:"50%",display:"flex",justifyContent:"center",alignItems:"center",marginBottom:"20px",animation:"pulse 2s infinite"},exclamation:{color:"white",fontSize:"60px",fontWeight:"bold"},title:{fontSize:"32px",marginBottom:"10px",textAlign:"center"},message:{fontSize:"18px",color:"#666666",textAlign:"center",maxWidth:"400px"},button:{marginTop:"30px",padding:"12px 24px",background:"#ff4444",border:"none",borderRadius:"5px",color:"white",fontSize:"16px",cursor:"pointer",transition:"background 0.3s"},"@keyframes pulse":{"0%":{transform:"scale(1)",boxShadow:"0 0 0 0 rgba(255, 68, 68, 0.7)"},"70%":{transform:"scale(1.1)",boxShadow:"0 0 0 10px rgba(255, 68, 68, 0)"},"100%":{transform:"scale(1)",boxShadow:"0 0 0 0 rgba(255, 68, 68, 0)"}}},o=()=>{window.history.back()};return r.useEffect(()=>{const e=document.createElement("style");return e.textContent=`
      @keyframes pulse {
        0% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7);
        }
        70% {
          transform: scale(1.1);
          box-shadow: 0 0 0 10px rgba(255, 68, 68, 0);
        }
        100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(255, 68, 68, 0);
        }
      }
    `,document.head.appendChild(e),()=>{document.head.removeChild(e)}},[]),n.jsxs("div",{style:t.container,children:[n.jsx("div",{style:t.icon,children:n.jsx("span",{style:t.exclamation,children:"!"})}),n.jsx("h1",{style:t.title,children:"Acceso Denegado"}),n.jsx("p",{style:t.message,children:"Lo sentimos, no tienes permiso para acceder a esta página."}),n.jsx("button",{style:t.button,onClick:o,onMouseOver:e=>e.currentTarget.style.background="#ff6666",onMouseOut:e=>e.currentTarget.style.background="#ff4444",children:"Volver atrás"})]})};export{s as default};
