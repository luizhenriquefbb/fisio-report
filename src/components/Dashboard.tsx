import { Users, CheckCircle, Activity, AlertCircle, FileDown, Plus, MoreVertical, ChevronDown, Trash2 } from 'lucide-react';
import { invoke } from "@tauri-apps/api/core";
import { message, confirm } from "@tauri-apps/plugin-dialog";
import { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import NewRecordModal from './NewRecordModal';

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

interface DashboardRecord {
  id: number;
  playerId: number;
  name: string;
  position: string;
  complaintId: number;
  complaint: string;
  shiftId: number;
  period: string;
  treatmentId: number;
  treatment: string;
  statusId: number;
  status: string;
  statusColor: string;
  observation: string;
}

interface LookupItem {
  id: number;
  name: string;
  color?: string;
}

interface Player {
  id: number;
  name: string;
  position: string;
  photo?: string;
}

interface LookupData {
  players: Player[];
  complaints: LookupItem[];
  shifts: LookupItem[];
  treatments: LookupItem[];
  status: LookupItem[];
}

const Dashboard = () => {
  const [records, setRecords] = useState<DashboardRecord[]>([]);
  const [lookupData, setLookupData] = useState<LookupData | null>(null);
  const [showNewRecordModal, setShowNewRecordModal] = useState(false);

  useEffect(() => {
    loadData();
    loadLookupData();
  }, []);

  const loadData = async () => {
    try {
      const data = await invoke<DashboardRecord[]>("get_dashboard_data");
      setRecords(data);
    } catch (err) {
      console.error(err);
      await message("Erro ao carregar dados: " + err, { title: 'Erro', kind: 'error' });
    }
  };

  const loadLookupData = async () => {
    try {
      const data = await invoke<LookupData>("get_lookup_options");
      setLookupData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await invoke("generate_report_pdf");
      await message(res as string, { title: 'Sucesso', kind: 'info' });
    } catch (err) {
      await message(err as string, { title: 'Erro', kind: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm('Tem certeza que deseja excluir este registro?', { title: 'Confirmar Exclusão', kind: 'warning' });
    if (!confirmed) return;

    try {
      await invoke("delete_record_by_id", { id });
      loadData();
      await message("Registro excluído com sucesso.", { title: 'Sucesso', kind: 'info' });
    } catch (err) {
      await message("Erro ao excluir: " + err, { title: 'Erro', kind: 'error' });
    }
  };

  const handleUpdate = async (record: DashboardRecord, field: string, value: string) => {
    const updatedRecord = { ...record, [field]: parseInt(value) };
    
    // Optimistic update
    setRecords(records.map(r => r.id === record.id ? { ...r, [field]: parseInt(value) } : r));

    try {
      await invoke("update_existing_record", {
        request: {
          id: updatedRecord.id,
          playerId: updatedRecord.playerId,
          complaintId: updatedRecord.complaintId,
          shiftId: updatedRecord.shiftId,
          treatmentId: updatedRecord.treatmentId,
          statusId: updatedRecord.statusId,
          observation: updatedRecord.observation
        }
      });
      // Reload to ensure consistency (e.g. if colors need to update based on status)
      loadData();
    } catch (err) {
      await message("Erro ao atualizar: " + err, { title: 'Erro', kind: 'error' });
      loadData(); // Revert
    }
  };

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
            <button 
              className="btn btn-dark d-flex align-items-center px-3" 
              style={{ borderRadius: '8px', backgroundColor: '#1a233a' }}
              onClick={() => setShowNewRecordModal(true)}
            >
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
                        <select 
                          className="form-select border-0 bg-transparent fw-bold p-0 select-inline" 
                          value={record.playerId}
                          onChange={(e) => handleUpdate(record, 'playerId', e.target.value)}
                          aria-label="Selecionar Atleta"
                        >
                           {lookupData?.players.map(p => (
                             <option key={p.id} value={p.id}>{p.name}</option>
                           ))}
                        </select>
                        <small className="text-muted d-block">{record.position}</small>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 border-0">
                    <select 
                      className="form-select border-0 bg-transparent p-0 select-inline" 
                      value={record.complaintId}
                      onChange={(e) => handleUpdate(record, 'complaintId', e.target.value)}
                      aria-label="Selecionar Queixa"
                    >
                       {lookupData?.complaints.map(c => (
                         <option key={c.id} value={c.id}>{c.name}</option>
                       ))}
                    </select>
                  </td>
                  <td className="py-3 border-0">
                     <select 
                      className="form-select border-0 bg-transparent p-0 select-inline" 
                      value={record.shiftId}
                      onChange={(e) => handleUpdate(record, 'shiftId', e.target.value)}
                      aria-label="Selecionar Período"
                    >
                       {lookupData?.shifts.map(s => (
                         <option key={s.id} value={s.id}>{s.name}</option>
                       ))}
                    </select>
                  </td>
                  <td className="py-3 border-0">
                     <select 
                      className="form-select border-0 bg-transparent p-0 select-inline" 
                      value={record.treatmentId}
                      onChange={(e) => handleUpdate(record, 'treatmentId', e.target.value)}
                      aria-label="Selecionar Tratamento"
                    >
                       {lookupData?.treatments.map(t => (
                         <option key={t.id} value={t.id}>{t.name}</option>
                       ))}
                    </select>
                  </td>
                  <td className="py-3 border-0">
                    <div className="position-relative">
                        <select 
                        className="form-select border-0 bg-transparent p-0 ps-3 fw-bold select-inline" 
                        value={record.statusId}
                        onChange={(e) => handleUpdate(record, 'statusId', e.target.value)}
                        style={{ color: record.statusColor }}
                        aria-label="Selecionar Status"
                        >
                        {lookupData?.status.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                        </select>
                        <span 
                            className="position-absolute rounded-circle" 
                            style={{ 
                                width: '8px', 
                                height: '8px', 
                                backgroundColor: record.statusColor,
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)'
                            }}
                        ></span>
                    </div>
                  </td>
                  <td className="py-3 border-0 text-muted small" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {record.observation}
                  </td>
                  <td className="pe-4 py-3 border-0 text-end">
                    <Dropdown align="end">
                        <Dropdown.Toggle variant="link" className="text-muted p-0 border-0" id={`dropdown-${record.id}`}>
                             <MoreVertical size={18} />
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item className="text-danger d-flex align-items-center" onClick={() => handleDelete(record.id)}>
                                <Trash2 size={14} className="me-2" />
                                Deletar
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <NewRecordModal 
        show={showNewRecordModal} 
        onHide={() => setShowNewRecordModal(false)} 
        onSave={loadData}
      />
    </div>
  );
};

export default Dashboard;

