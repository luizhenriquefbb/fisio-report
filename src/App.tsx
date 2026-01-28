import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Athletes from './pages/Athletes';
import Complaints from './pages/Complaints';
import Treatments from './pages/Treatments';
import Shifts from './pages/Shifts';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';
import { Menu } from 'lucide-react';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
      // Optional: Verify token validity on load
  }, []);

  if (!token) {
      if (isRegistering) {
          return <Register onRegister={() => setIsRegistering(false)} onBack={() => setIsRegistering(false)} />;
      }
      return <Login onLogin={() => setToken(localStorage.getItem('token'))} onRegister={() => setIsRegistering(true)} />;
  }

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'atletas': return <Athletes />;
      case 'queixas': return <Complaints />;
      case 'tratamentos': return <Treatments />;
      case 'periodos': return <Shifts />;
      case 'relatorios': return <Reports />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="d-flex" style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && <div className="sidebar-overlay d-md-none" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Sidebar Wrapper */}
      <div className={`sidebar-wrapper ${isSidebarOpen ? 'active' : ''}`}>
        <Sidebar 
            currentPage={currentPage} 
            onNavigate={(page) => { 
                setCurrentPage(page); 
                setIsSidebarOpen(false); 
            }} 
            onLogout={() => { 
                localStorage.removeItem('token'); 
                setToken(null); 
            }} 
            onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      <div className="flex-grow-1 d-flex flex-column" style={{ overflowY: 'auto' }}>
        
        {/* Mobile Header with Toggle */}
        <div className="mobile-header p-3 bg-white border-bottom align-items-center justify-content-between">
            <button className="btn btn-link p-0 text-dark" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} />
            </button>
            <span className="fw-bold">FisioReport</span>
            <div style={{width: 24}}></div> {/* Spacer to center title */}
        </div>

        <main>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
