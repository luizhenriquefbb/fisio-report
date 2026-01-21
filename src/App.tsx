import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <div className="d-flex" style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column" style={{ overflowY: 'auto' }}>
        <Header />
        <main>
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

export default App;