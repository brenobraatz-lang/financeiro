import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DespesasPage from './pages/DespesasPage';
import DashboardPage from './pages/DashboardPage';
import CaixaPage from './pages/CaixaPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppContent() {
  const { isAuthenticated, logout, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo-section">
            <img src="/logo.webp" alt="Logo Sistema Financeiro" className="nav-logo-img" />
          </Link>
          <div className="nav-links">
            <Link to="/">Dashboard</Link>
            <Link to="/despesas">Despesas</Link>
            <Link to="/caixa">Caixa</Link>
            <Link to="/settings">⚙️ Configurações</Link>
          </div>
          <div className="nav-user">
            <span className="user-email">{user?.email}</span>
            <button onClick={logout} className="logout-btn">Sair</button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/despesas" element={<ProtectedRoute><DespesasPage /></ProtectedRoute>} />
          <Route path="/caixa" element={<ProtectedRoute><CaixaPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
