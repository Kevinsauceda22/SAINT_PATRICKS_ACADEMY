import React from 'react';

const AccessDenied = () => {




  // Agregar la animación al documento
  React.useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes expandWidth {
        0% { width: 0; }
        100% { width: 100%; }
      }
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.05); opacity: 1; }
        100% { transform: scale(1); opacity: 0.7; }
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
     <div className="h-screen flex flex-col justify-center items-center bg-white font-sans">
      <div className="flex flex-col items-center">
        {/* Main loader container */}
        <div className="relative w-32 h-10 mb-6">
          {/* Background track */}
          <div className="absolute w-full h-2 bg-gray-100 rounded-full overflow-hidden top-3">
            {/* Animated progress bar */}
            <div className="h-full bg-green-500 rounded-full" 
                 style={{
                   animation: 'expandWidth 2s infinite ease-in-out',
                   boxShadow: '0 0 10px rgba(52, 211, 153, 0.7)'
                 }}>
            </div>
          </div>
          {/* Animated circle indicator */}
          <div className="absolute w-8 h-8 bg-green-500 rounded-full flex justify-center items-center"
               style={{
                 animation: 'spin 2s infinite linear, pulse 2s infinite ease-in-out',
                 boxShadow: '0 0 15px rgba(52, 211, 153, 0.9)',
                 left: 'calc(50% - 16px)'
               }}>
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
        <p className="text-green-600 font-medium text-center mt-4">Cargando...</p>
      </div>
    </div>
  );
};

export default AccessDenied;