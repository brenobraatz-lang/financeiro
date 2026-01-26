// Padrão de estilos para todas as páginas
export const pageStyles = {
  container: {
    minHeight: '100vh',
    background: '#f9f9f9',
    padding: '0'
  },
  wrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1.5rem'
  },
  header: {
    background: '#1a1a1a',
    color: 'white',
    padding: '2rem 1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: 0,
    maxWidth: '1200px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  card: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem'
  },
  button: {
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  buttonPrimary: {
    background: '#333333',
    color: 'white'
  },
  buttonSecondary: {
    background: '#e0e0e0',
    color: '#333'
  },
  buttonDanger: {
    background: '#f44336',
    color: 'white'
  },
  formGroup: {
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  label: {
    fontWeight: '500',
    fontSize: '14px',
    color: '#333'
  },
  input: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  infoBox: {
    background: '#f5f5f5',
    padding: '1.5rem',
    borderRadius: '8px',
    borderLeft: '4px solid #666',
    marginBottom: '1.5rem'
  },
  warningBox: {
    background: '#fff3cd',
    padding: '1.5rem',
    borderRadius: '8px',
    borderLeft: '4px solid #ffc107',
    marginBottom: '1.5rem'
  },
  dangerBox: {
    background: '#ffebee',
    padding: '1.5rem',
    borderRadius: '8px',
    borderLeft: '4px solid #f44336',
    marginBottom: '1.5rem'
  },
  successBox: {
    background: '#e8f5e9',
    padding: '1.5rem',
    borderRadius: '8px',
    borderLeft: '4px solid #4CAF50',
    marginBottom: '1.5rem'
  },
  tab: {
    borderBottom: '2px solid #f0f0f0',
    marginBottom: '2rem',
    display: 'flex',
    gap: '1rem'
  },
  tabButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#999',
    borderBottom: '3px solid transparent',
    transition: 'all 0.3s ease'
  },
  tabButtonActive: {
    color: '#333',
    borderBottomColor: '#333'
  },
  gridAuto: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap' as const
  }
};
