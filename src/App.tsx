import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Athletes from './pages/Athletes';
import Complaints from './pages/Complaints';
import Treatments from './pages/Treatments';
import Shifts from './pages/Shifts';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'atletas': return <Athletes />;
      case 'queixas': return <Complaints />;
      case 'tratamentos': return <Treatments />;
      case 'periodos': return <Shifts />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="d-flex" style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-grow-1 d-flex flex-column" style={{ overflowY: 'auto' }}>
        <Header />
        <main>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;