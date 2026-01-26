import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { pageStyles } from '../styles/pageLayout';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f9f9f9',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        animation: 'slideUp 0.5s ease-out'
      }}>
        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
        
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{
            color: '#1a1a1a',
            margin: '0 0 10px 0',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>Sistema Financeiro</h1>
          <p style={{
            color: '#666',
            margin: '0',
            fontSize: '14px'
          }}>Controle suas finanças com segurança</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={pageStyles.formGroup}>
            <label htmlFor="email" style={pageStyles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
              style={{
                ...pageStyles.input,
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={pageStyles.formGroup}>
            <label htmlFor="password" style={pageStyles.label}>Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
              disabled={loading}
              style={{
                ...pageStyles.input,
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center',
              backgroundColor: '#fee',
              color: '#c00',
              border: '1px solid #fcc'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...pageStyles.button,
              ...pageStyles.buttonPrimary,
              width: '100%',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '6px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#666',
          borderLeft: '3px solid #999'
        }}>
          <p style={{ margin: 0 }}>Acesso restrito ao administrador</p>
        </div>
      </div>
    </div>
  );
}
