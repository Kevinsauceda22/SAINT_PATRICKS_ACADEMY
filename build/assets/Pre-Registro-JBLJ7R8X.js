import{o as E,r as n,j as e,i as z}from"./index-SVRFFNc9.js";import{S as p}from"./sweetalert2.esm.all-D3pEHXw3.js";import{R}from"./refresh-cw-O16dAa9U.js";import{C as Y}from"./check-CzPZpIZL.js";import{C as I}from"./copy-Bvy9txOW.js";import{E as B,a as D}from"./eye-C-La4pM4.js";import"./createLucideIcon-CPQyE5BK.js";const M=()=>{const w=E(),[r,d]=n.useState({primerNombre:"",primerApellido:"",identificador:"",contraseña_usuario:"",confirmPassword:""}),[a,v]=n.useState({}),[c,j]=n.useState(!1),[l,u]=n.useState(""),[i,f]=n.useState(1),[y,x]=n.useState(!1),N={débil:"#ff4d4d",media:"#ffd700",fuerte:"#00cc00"},g=(o,t)=>{const s=o.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑñ\s]/gi,"");d({...r,[t]:s})},C=o=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o),b=o=>{const t=new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"),s=new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");t.test(o)?u("fuerte"):s.test(o)?u("media"):u("débil")},k=async()=>{try{await navigator.clipboard.writeText(r.contraseña_usuario),x(!0),setTimeout(()=>x(!1),2e3),p.fire({icon:"success",title:"¡Copiado!",text:"Contraseña copiada al portapapeles",showConfirmButton:!1,timer:1500,position:"top-end",toast:!0})}catch{p.fire({icon:"error",title:"Error",text:"No se pudo copiar al portapapeles",showConfirmButton:!1,timer:1500,position:"top-end",toast:!0})}},P=()=>{const o="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";let t="";for(let s=0;s<12;s++)t+=o.charAt(Math.floor(Math.random()*o.length));b(t),d(s=>({...s,contraseña_usuario:t,confirmPassword:t})),p.fire({icon:"success",title:"¡Contraseña Generada!",text:"Se ha generado una nueva contraseña segura",showConfirmButton:!1,timer:1500,position:"top-end",toast:!0})},h=o=>{const t={};return o===1?(r.primerNombre||(t.primerNombre="Primer nombre es requerido"),r.primerApellido||(t.primerApellido="Primer apellido es requerido"),r.identificador?C(r.identificador)||(t.identificador="Correo no válido"):t.identificador="Correo es requerido"):o===2&&(r.contraseña_usuario?r.contraseña_usuario.length<6&&(t.contraseña_usuario="La contraseña debe tener al menos 6 caracteres"):t.contraseña_usuario="Contraseña es requerida",r.contraseña_usuario!==r.confirmPassword&&(t.confirmPassword="Las contraseñas no coinciden")),v(t),Object.keys(t).length===0},S=()=>{h(i)&&f(i+1)},_=()=>{f(i-1)},A=async o=>{var t,s;if(o.preventDefault(),!!h(i))try{const m=await z.post("http://74.50.68.87:4000/api/usuarios/pre-registrar-padre",{primer_nombre:r.primerNombre,primer_apellido:r.primerApellido,correo_usuario:r.identificador,contraseña_usuario:r.contraseña_usuario,confirmar_contraseña:r.confirmPassword,Primer_ingreso:!0});p.fire({icon:"success",title:"¡Registro Exitoso!",text:"Por favor, revisa tu correo electrónico para confirmar.",confirmButtonColor:"#4f46e5"}),w(`/confirmacion-email/${r.identificador}`)}catch(m){console.error(m),p.fire({icon:"error",title:"Error",text:((s=(t=m.response)==null?void 0:t.data)==null?void 0:s.mensaje)||"Error al registrar el usuario.",confirmButtonColor:"#4f46e5"})}};return e.jsxs("div",{className:"form-container",children:[e.jsxs("div",{className:"form-card",children:[e.jsxs("div",{className:"form-header",children:[e.jsxs("div",{className:"step-indicator",children:[e.jsx("div",{className:`step ${i>=1?"active":""}`,children:"1"}),e.jsx("div",{className:"step-line"}),e.jsx("div",{className:`step ${i>=2?"active":""}`,children:"2"})]}),e.jsx("h1",{children:"Pre-Registro"}),e.jsx("p",{children:"Registro para Padres de Familia o Tutores"})]}),e.jsxs("form",{onSubmit:A,className:"multi-step-form",children:[i===1&&e.jsxs("div",{className:"form-step",children:[e.jsxs("div",{className:"input-group",children:[e.jsx("label",{children:"Primer Nombre*"}),e.jsx("input",{type:"text",value:r.primerNombre,onChange:o=>g(o,"primerNombre"),className:a.primerNombre?"error":"",placeholder:"NOMBRE"}),a.primerNombre&&e.jsx("span",{className:"error-message",children:a.primerNombre})]}),e.jsxs("div",{className:"input-group",children:[e.jsx("label",{children:"Primer Apellido*"}),e.jsx("input",{type:"text",value:r.primerApellido,onChange:o=>g(o,"primerApellido"),className:a.primerApellido?"error":"",placeholder:"APELLIDO"}),a.primerApellido&&e.jsx("span",{className:"error-message",children:a.primerApellido})]}),e.jsxs("div",{className:"input-group",children:[e.jsx("label",{children:"Correo Electrónico*"}),e.jsx("input",{type:"email",value:r.identificador,onChange:o=>d({...r,identificador:o.target.value}),className:a.identificador?"error":"",placeholder:"ejemplo@correo.com"}),a.identificador&&e.jsx("span",{className:"error-message",children:a.identificador})]}),e.jsx("button",{type:"button",onClick:S,className:"next-button",children:"Siguiente"})]}),i===2&&e.jsxs("div",{className:"form-step",children:[e.jsxs("div",{className:"password-section",children:[e.jsxs("div",{className:"password-generator",children:[e.jsxs("button",{type:"button",onClick:P,className:"generate-button",children:[e.jsx(R,{size:16})," Generar Contraseña"]}),r.contraseña_usuario&&e.jsxs("div",{className:"generated-password",children:[e.jsx("input",{type:c?"text":"password",value:r.contraseña_usuario,readOnly:!0}),e.jsx("button",{type:"button",onClick:k,className:"copy-button",children:y?e.jsx(Y,{size:16}):e.jsx(I,{size:16})})]})]}),e.jsxs("div",{className:"input-group",children:[e.jsx("label",{children:"Contraseña:‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ "}),e.jsxs("div",{className:"password-input",children:[e.jsx("input",{type:c?"text":"password",value:r.contraseña_usuario,onChange:o=>{d({...r,contraseña_usuario:o.target.value}),b(o.target.value)},className:a.contraseña_usuario?"error":"",placeholder:"Contraseña"}),e.jsx("button",{type:"button",onClick:()=>j(!c),className:"toggle-password",children:c?e.jsx(B,{size:16}):e.jsx(D,{size:16})})]}),l&&e.jsxs("div",{className:"password-strength",children:[e.jsx("div",{className:"strength-bar",style:{width:l==="débil"?"33%":l==="media"?"66%":"100%",backgroundColor:N[l]}}),e.jsx("span",{children:l.toUpperCase()})]}),a.contraseña_usuario&&e.jsx("span",{className:"error-message",children:a.contraseña_usuario})]}),e.jsxs("div",{className:"input-group",children:[e.jsx("label",{children:"Confirmar Contraseña:‎ ‎ ‎ ‎ "}),e.jsx("div",{className:"password-input",children:e.jsx("input",{type:c?"text":"password",value:r.confirmPassword,onChange:o=>d({...r,confirmPassword:o.target.value}),className:a.confirmPassword?"error":"",placeholder:"Confirma tu contraseña"})}),a.confirmPassword&&e.jsx("span",{className:"error-message",children:a.confirmPassword})]})]}),e.jsxs("div",{className:"button-group",children:[e.jsx("button",{type:"button",onClick:_,className:"prev-button",children:"Atrás"}),e.jsx("button",{type:"submit",className:"submit-button",children:"Registrar"})]})]})]})]}),e.jsx("style",{children:`
        .form-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f6f7ff 0%, #f0f3ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          font-family: 'Inter', sans-serif;
        }

        .form-card {
          background: white;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          padding: 40px;
          width: 100%;
          max-width: 600px;
          transform: translateY(0);
          transition: transform 0.3s ease;
        }

        .form-card:hover {
          transform: translateY(-5px);
        }

        .form-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .form-header h1 {
          font-size: 32px;
          color: #1a1a1a;
          margin: 0 0 8px;
          font-weight: 700;
        }

        .form-header p {
          color: #666;
          margin: 0;
        }

        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
        }

        .step {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .step.active {
          background: #4f46e5;
          color: white;
        }

        .step-line {
          height: 2px;
          width: 100px;
          background: #e0e0e0;
          margin: 0 16px;
        }

        .input-group {
          margin-bottom: 30px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          color: #1a1a1a;
          font-weight: 500;
        }

        .input-group input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          outline: none;
        }

        .input-group input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }

        .input-group input.error {
          border-color: #ff4d4d;
          background-color: #fff5f5;
        }

        .error-message {
          color: #ff4d4d;
          font-size: 14px;
          margin-top: 4px;
          display: block;
          animation: slideIn 0.3s ease;
        }

        .password-section {
          background: #f8fafc;
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          border: 2px solid #e0e0e0;
        }

        .password-generator {
          margin-bottom: 24px;
        }

        .generate-button {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .generate-button:hover {
          background: #4338ca;
          transform: translateY(-2px);
        }

        .generate-button:active {
          transform: translateY(0);
        }

        .generated-password {
          margin-top: 16px;
          display: flex;
          gap: 8px;
        }

        .generated-password input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-family: monospace;
          font-size: 16px;
          background: white;
        }

        .copy-button {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .copy-button:hover {
          background: #4338ca;
          transform: scale(1.05);
        }

        .password-input {
          position: relative;
        }

        .toggle-password {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .password-strength {
          margin-top: 8px;
          background: #f1f1f1;
          border-radius: 8px;
          overflow: hidden;
        }

        .strength-bar {
          height: 4px;
          transition: all 0.3s ease;
        }

        .password-strength span {
          display: block;
          text-align: center;
          font-size: 12px;
          margin-top: 4px;
          color: #666;
        }

        .button-group {
          display: flex;
          gap: 16px;
          margin-top: 32px;
        }

        .prev-button,
        .next-button,
        .submit-button {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
        }

        .prev-button {
          background: #f1f1f1;
          border: none;
          color: #666;
        }

        .prev-button:hover {
          background: #e0e0e0;
        }

        .next-button,
        .submit-button {
          background: #4f46e5;
          border: none;
          color: white;
        }

        .next-button:hover,
        .submit-button:hover {
          background: #4338ca;
          transform: translateY(-2px);
        }

        .next-button:active,
        .submit-button:active {
          transform: translateY(0);
        }

        /* Animations */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .form-step {
          animation: fadeIn 0.3s ease;
        }

        /* Responsive Design */
        @media (max-width: 640px) {
          .form-card {
            padding: 24px;
          }

          .step-line {
            width: 60px;
          }

          .button-group {
            flex-direction: column;
          }

          .prev-button,
          .next-button,
          .submit-button {
            width: 100%;
          }
        }

        /* Loading Animation */
        .loading {
          position: relative;
        }

        .loading::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
        }

        /* Toast Animation */
        .swal2-popup {
          animation: swal2-show 0.3s;
        }

        .swal2-toast {
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-radius: 12px;
        }

        /* Additional Hover Effects */
        .input-group input:hover {
          border-color: #6366f1;
        }

        .toggle-password:hover {
          color: #4f46e5;
        }

        /* Focus States */
        button:focus-visible,
        input:focus-visible {
          outline: 2px solid #4f46e5;
          outline-offset: 2px;
        }

        /* Disabled States */
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Success States */
        input.success {
          border-color: #10b981;
        }

        /* Card Hover Effect */
        .form-card {
          position: relative;
        }

        .form-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 24px;
          pointer-events: none;
          transition: all 0.3s ease;
          z-index: -1;
        }

        .form-card:hover::after {
          box-shadow: 0 20px 60px rgba(79, 70, 229, 0.1);
        }
      `})]})};export{M as default};
