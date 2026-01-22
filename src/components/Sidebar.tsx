import { LayoutDashboard, Users, Activity, Stethoscope, Clock, FileText, Settings } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Sidebar = ({ currentPage, onNavigate }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'atletas', icon: Users, label: 'Atletas' },
    { id: 'queixas', icon: Activity, label: 'Queixas' },
    { id: 'tratamentos', icon: Stethoscope, label: 'Tratamentos' },
    { id: 'periodos', icon: Clock, label: 'Períodos' },
    { id: 'relatorios', icon: FileText, label: 'Relatórios' },
  ];

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: '280px', height: '100vh', backgroundColor: '#1a233a' }}>
      <div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <div className="bg-info rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
             <Activity size={24} color="white" />
        </div>
        <div>
            <h5 className="mb-0 fw-bold">FisioReport</h5>
            <small className="text-uppercase" style={{ fontSize: '0.65rem', opacity: 0.7 }}>Departamento Médico</small>
        </div>
      </div>
      <hr />
      <small className="text-uppercase mb-3" style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 'bold' }}>Menu Principal</small>
      <ul className="nav nav-pills flex-column mb-auto">
        {menuItems.map((item) => (
          <li key={item.id} className="nav-item">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
              className={`nav-link text-white d-flex align-items-center ${currentPage === item.id ? 'active' : ''}`} 
              style={{ backgroundColor: currentPage === item.id ? '#344161' : 'transparent', marginBottom: '5px' }}
            >
              <item.icon className="me-3" size={18} />
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <hr />
      <div className="nav nav-pills flex-column">
          <a href="#" className="nav-link text-white d-flex align-items-center">
            <Settings className="me-3" size={18} />
            Configurações
          </a>
      </div>
    </div>
  );
};

export default Sidebar;
