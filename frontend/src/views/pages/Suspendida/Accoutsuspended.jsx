import React from 'react';

const SuspendedAccountPage = () => {
  const handleLogout = () => {
    localStorage.removeItem('token'); // Elimina el token del localStorage
    window.location.href = '/login'; // Redirige al login
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logo}>
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              style={styles.logoSvg}
            >
              <path 
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4-11h-2v4h-4v-2h2V9h2v2z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        <div style={styles.content}>
          <h1 style={styles.title}>Cuenta Suspendida</h1>
          
          <div style={styles.alert}>
            <div style={styles.alertIcon}>
              <div style={styles.alertDot}></div>
            </div>
            <div style={styles.alertContent}>
              <p style={styles.alertTitle}>Su cuenta ha sido suspendida</p>
              <p style={styles.alertDescription}>
                Por favor, póngase en contacto con el soporte técnico para resolver esta situación. 
                Su acceso será restablecido una vez se solucione el problema.
              </p>
            </div>
          </div>

          <div style={styles.infoBox}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Estado</span>
              <span style={styles.infoValue}>Suspendido</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Razón</span>
              <span style={styles.infoValue}>Violación de las políticas de uso</span>
            </div>
          </div>

          <button 
            style={styles.logoutButton}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.15)';
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
    width: '100%',
    maxWidth: '480px',
    overflow: 'hidden',
  },
  logoContainer: {
    backgroundColor: '#f1f5f9',
    padding: '24px',
    display: 'flex',
    justifyContent: 'center',
    borderBottom: '1px solid #e2e8f0',
  },
  logo: {
    backgroundColor: '#ef4444',
    color: 'white',
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSvg: {
    width: '32px',
    height: '32px',
  },
  content: {
    padding: '32px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '24px',
    textAlign: 'center',
  },
  alert: {
    display: 'flex',
    backgroundColor: '#fee2e2',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px',
    gap: '16px',
    alignItems: 'flex-start',
  },
  alertIcon: {
    width: '24px',
    height: '24px',
    backgroundColor: '#ef4444',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
  },
  alertDot: {
    width: '8px',
    height: '8px',
    backgroundColor: 'white',
    borderRadius: '50%',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    color: '#b91c1c',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  alertDescription: {
    color: '#dc2626',
    fontSize: '14px',
    lineHeight: 1.5,
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
  },
  infoValue: {
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.15)',
  },
};

export default SuspendedAccountPage;
