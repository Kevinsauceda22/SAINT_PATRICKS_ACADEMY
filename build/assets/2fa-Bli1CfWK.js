import{r as o,o as w,A as j,j as e}from"./index-SVRFFNc9.js";const y=()=>{const[u,h]=o.useState(""),[n,c]=o.useState(!1),[p,d]=o.useState(""),[l,g]=o.useState(!1),r=w(),{auth:a,setAuth:m}=o.useContext(j);o.useEffect(()=>{if(!a||a.is_two_factor_enabled!==1){r("/login");return}a.two_factor_verified&&f(a.cod_estado_usuario)},[a,r]);const f=s=>{switch(s){case 1:r("/dashboard");break;case 2:r("/CuentaenRevision");break;case 3:r("/CuentaSuspendida");break;default:d("Estado de usuario desconocido");break}},x=s=>{let t=s.target.value.replace(/\D/g,"");t.length>3&&(t=t.slice(0,3)+"-"+t.slice(3,6)),h(t)},b=async s=>{s.preventDefault(),c(!0),d("");const t=localStorage.getItem("token");if(!t){d("No hay sesión activa"),c(!1);return}try{const i=await fetch("http://74.50.68.87:4000/api/usuarios/verifyTwoFactorAuthCode",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({twoFactorCode:u.replace(/-/g,"")})}),v=await i.json();if(!i.ok)throw new Error(v.message||"Error al verificar el código");g(!0),a&&m({...a,otp_verified:!0}),setTimeout(()=>{r("/dashboard")},2e3)}catch(i){console.error("Error en verificación 2FA:",i),d(i.message||"Error al verificar el código. Por favor, intenta de nuevo.")}finally{c(!1)}};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
          .auth-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
          }

          .auth-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            padding: 2rem;
            position: relative;
            transform: translateY(0);
            transition: transform 0.3s ease;
          }

          .auth-card:hover {
            transform: translateY(-5px);
          }

          .auth-title {
            color: #1a1a1a;
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            text-align: center;
          }

          .auth-subtitle {
            color: #666;
            font-size: 0.875rem;
            text-align: center;
            margin-bottom: 2rem;
            line-height: 1.5;
          }

          .input-group {
            position: relative;
            margin-bottom: 1.5rem;
          }

          .auth-input {
            width: 100%;
            padding: 12px 16px;
            font-size: 1.25rem;
            border: 2px solid #e1e1e1;
            border-radius: 8px;
            outline: none;
            transition: all 0.3s ease;
            text-align: center;
            letter-spacing: 2px;
          }

          .auth-input:focus {
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
          }

          .auth-input::placeholder {
            color: #a0a0a0;
            letter-spacing: normal;
          }

          .auth-button {
            width: 100%;
            padding: 12px;
            background: #4f46e5;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }

          .auth-button:hover:not(:disabled) {
            background: #4338ca;
            transform: translateY(-1px);
          }

          .auth-button:disabled {
            background: #a5a5a5;
            cursor: not-allowed;
          }

          .auth-button.loading {
            color: transparent;
          }

          .auth-button.loading::after {
            content: "";
            position: absolute;
            width: 20px;
            height: 20px;
            top: 50%;
            left: 50%;
            margin: -10px 0 0 -10px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .error-message {
            background: #fee2e2;
            color: #dc2626;
            padding: 12px;
            border-radius: 8px;
            margin-top: 1rem;
            font-size: 0.875rem;
            animation: shake 0.5s ease-in-out;
            text-align: center;
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }

          .success-message {
            background: #dcfce7;
            color: #16a34a;
            padding: 12px;
            border-radius: 8px;
            margin-top: 1rem;
            font-size: 0.875rem;
            animation: slideIn 0.5s ease-in-out;
            text-align: center;
          }

          @keyframes slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .input-hint {
            color: #666;
            font-size: 0.75rem;
            margin-top: 0.5rem;
            text-align: center;
          }
        `}),e.jsx("div",{className:"auth-container",children:e.jsxs("div",{className:"auth-card",children:[e.jsx("h1",{className:"auth-title",children:"Verificación de 2FA"}),e.jsxs("p",{className:"auth-subtitle",children:["Ingresa el código de 6 dígitos de tu aplicación autenticadora",e.jsx("br",{}),"El código se actualiza cada 30 segundos"]}),e.jsxs("form",{onSubmit:b,children:[e.jsxs("div",{className:"input-group",children:[e.jsx("input",{type:"text",className:"auth-input",value:u,onChange:x,placeholder:"000-000",required:!0,maxLength:"7",disabled:n||l,autoComplete:"one-time-code"}),e.jsx("p",{className:"input-hint",children:"Formato: XXX-XXX"})]}),e.jsx("button",{type:"submit",className:`auth-button ${n?"loading":""}`,disabled:n||l,children:n?"Verificando...":"Verificar Código"}),p&&e.jsx("div",{className:"error-message",children:p}),l&&e.jsx("div",{className:"success-message",children:"Verificación exitosa. Redirigiendo..."})]})]})})]})};export{y as default};
