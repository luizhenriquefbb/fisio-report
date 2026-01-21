import { Users, CheckCircle, Activity, AlertCircle, FileDown, Plus, MoreVertical, ChevronDown } from 'lucide-react';
import { invoke } from "@tauri-apps/api/core";
import { message } from "@tauri-apps/plugin-dialog";

const SummaryCard = ({ title, count, icon: Icon, color, bgColor }: any) => (
  <div className="card border-0 shadow-sm flex-fill" style={{ backgroundColor: bgColor, borderRadius: '12px' }}>
    <div className="card-body d-flex justify-content-between align-items-center p-4">
      <div>
        <small className="text-muted fw-semibold d-block mb-1">{title}</small>
        <h2 className="mb-0 fw-bold">{count}</h2>
      </div>
      <div className="p-3 rounded-3" style={{ backgroundColor: color + '20' }}>
        <Icon size={24} style={{ color: color }} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const handleExportPDF = async () => {
    try {
      const res = await invoke("generate_report_pdf");
      await message(res as string, { title: 'Sucesso', kind: 'info' });
    } catch (err) {
      await message(err as string, { title: 'Erro', kind: 'error' });
    }
  };

  const records = [
    { id: 10, name: 'Rafael Lima', position: 'Meia', complaint: 'Dor Muscular', period: 'Manhã', treatment: 'Liberação Miofascial', status: 'TRANSIÇÃO', statusColor: '#F59E0B', observation: 'Apresentou melhora signific...' },
    { id: 9, name: 'Gabriel Souza', position: 'Atacante', complaint: 'Entorse', period: 'Tarde', treatment: 'Crioterapia', status: 'NO DM', statusColor: '#EF4444', observation: 'Entorse grau II, repouso rec...' },
    { id: 3, name: 'Marcos Santos', position: 'Zagueiro', complaint: 'Fadiga', period: 'Integral', treatment: 'Alongamento', status: 'LIBERADO', statusColor: '#10B981', observation: 'Adicionar observação...' },
  ];

  const totalAtletas = records.length;
  const liberados = records.filter(r => r.status === 'LIBERADO').length;
  const emTransicao = records.filter(r => r.status === 'TRANSIÇÃO').length;
  const noDm = records.filter(r => r.status === 'NO DM').length;

  return (
    <div className="p-4 bg-light" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="d-flex gap-4 mb-5">
        <SummaryCard title="Total de Atletas" count={totalAtletas} icon={Users} color="#6366F1" bgColor="white" />
        <SummaryCard title="Liberados" count={liberados} icon={CheckCircle} color="#10B981" bgColor="#ECFDF5" />
        <SummaryCard title="Em Transição" count={emTransicao} icon={Activity} color="#F59E0B" bgColor="#FFFBEB" />
        <SummaryCard title="No DM" count={noDm} icon={AlertCircle} color="#EF4444" bgColor="#FEF2F2" />
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
        <div className="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 fw-bold">Relatório do Dia</h5>
            <small className="text-muted">{totalAtletas} registros hoje</small>
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-secondary d-flex align-items-center px-3" 
              style={{ borderRadius: '8px' }}
              onClick={handleExportPDF}
            >
              <FileDown size={18} className="me-2" />
              Exportar PDF
            </button>
            <button className="btn btn-dark d-flex align-items-center px-3" style={{ borderRadius: '8px', backgroundColor: '#1a233a' }}>
              <Plus size={18} className="me-2" />
              Novo Registro
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          <table className="table mb-0 align-middle">
            <thead className="bg-light text-muted small text-uppercase fw-bold">
              <tr>
                <th className="ps-4 py-3 border-0">Atleta</th>
                <th className="py-3 border-0">Queixa</th>
                <th className="py-3 border-0">Período</th>
                <th className="py-3 border-0">Tratamento</th>
                <th className="py-3 border-0">Status</th>
                <th className="py-3 border-0">Observações</th>
                <th className="pe-4 py-3 border-0"></th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-top">
                  <td className="ps-4 py-3 border-0">
                    <div className="d-flex align-items-center">
                      <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
                        {record.id}
                      </div>
                      <div>
                        <div className="fw-bold">{record.name}</div>
                        <small className="text-muted">{record.position}</small>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 border-0">
                    <div className="d-flex align-items-center gap-2">
                        {record.complaint} <ChevronDown size={14} className="text-muted" />
                    </div>
                  </td>
                  <td className="py-3 border-0">
                    <div className="d-flex align-items-center gap-2">
                        {record.period} <ChevronDown size={14} className="text-muted" />
                    </div>
                  </td>
                  <td className="py-3 border-0">
                    <div className="d-flex align-items-center gap-2">
                        {record.treatment} <ChevronDown size={14} className="text-muted" />
                    </div>
                  </td>
                  <td className="py-3 border-0">
                    <span className="badge rounded-pill d-flex align-items-center gap-1" style={{ backgroundColor: record.statusColor, width: 'fit-content', padding: '6px 12px' }}>
                      <span className="bg-white rounded-circle" style={{ width: '6px', height: '6px' }}></span>
                      {record.status}
                      <ChevronDown size={12} className="ms-1" />
                    </span>
                  </td>
                  <td className="py-3 border-0 text-muted small" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {record.observation}
                  </td>
                  <td className="pe-4 py-3 border-0 text-end">
                    <MoreVertical size={18} className="text-muted" style={{ cursor: 'pointer' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
