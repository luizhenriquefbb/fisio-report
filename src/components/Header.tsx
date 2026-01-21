import { Search, Bell, Calendar } from 'lucide-react';

const Header = () => {
  return (
    <header className="d-flex justify-content-between align-items-center py-3 px-4 bg-white border-bottom">
      <div>
        <h4 className="mb-0 fw-bold">Dashboard</h4>
        <small className="text-muted">Visão geral do departamento médico</small>
      </div>
      
      <div className="d-flex align-items-center gap-4">
        <div className="position-relative">
          <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
          <input 
            type="text" 
            className="form-control ps-5 bg-light border-0" 
            placeholder="Buscar atleta..." 
            style={{ width: '300px', borderRadius: '8px' }}
          />
        </div>
        
        <div className="d-flex align-items-center text-muted">
          <Calendar className="me-2" size={18} />
          <small className="fw-semibold">Terça-Feira, 20 De Janeiro De 2026</small>
        </div>
        
        <div className="position-relative">
          <Bell size={20} className="text-muted" />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
            2
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
