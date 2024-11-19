import React from 'react';

const Page404 = () => {
  return (
    <div className="page-404">
      <div className="container">
        <div className="number-404">404</div>
        <div className="content">
          <h2>Página no encontrada</h2>
          <p>Oops! Parece que te has perdido en el ciberespacio.</p>
        </div>
        
        <div className="home-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
        </div>

        <a href="/" className="home-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Volver al inicio
        </a>

        <a href="/contact" className="support-link">
          ¿Necesitas ayuda? Contacta con soporte
        </a>

        <style jsx>{`
          .page-404 {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%);
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          }

          .container {
            text-align: center;
            max-width: 600px;
            width: 100%;
            padding: 40px 20px;
            position: relative;
          }

          .number-404 {
            font-size: 180px;
            font-weight: 800;
            color: rgba(59, 130, 246, 0.2);
            line-height: 1;
            letter-spacing: -10px;
          }

          .content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
          }

          h2 {
            font-size: 42px;
            color: #1f2937;
            margin-bottom: 16px;
          }

          p {
            color: #4b5563;
            font-size: 18px;
            margin-bottom: 32px;
          }

          .home-icon {
            width: 200px;
            height: 200px;
            background-color: #e5f0ff;
            border-radius: 50%;
            margin: 40px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
          }

          .home-icon:hover {
            transform: scale(1.05);
          }

          .home-icon svg {
            width: 80px;
            height: 80px;
            color: #3b82f6;
          }

          .home-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background-color: #3b82f6;
            color: white;
            padding: 12px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
          }

          .home-button:hover {
            background-color: #2563eb;
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(59, 130, 246, 0.3);
          }

          .home-button svg {
            width: 20px;
            height: 20px;
          }

          .support-link {
            display: inline-block;
            margin-top: 24px;
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
          }

          .support-link:hover {
            color: #2563eb;
            text-decoration: underline;
          }

          @media (max-width: 640px) {
            .number-404 {
              font-size: 120px;
            }

            h2 {
              font-size: 32px;
            }

            p {
              font-size: 16px;
            }

            .home-icon {
              width: 160px;
              height: 160px;
            }

            .home-icon svg {
              width: 60px;
              height: 60px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Page404;