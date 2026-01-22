import { invoke } from "@tauri-apps/api/core";
import { confirm, message } from "@tauri-apps/plugin-dialog";
import {
  Activity,
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle,
  FileDown,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";

import NewRecordModal from "./NewRecordModal";
import ObservationModal from "./ObservationModal";

const SummaryCard = ({ title, count, icon: Icon, color, bgColor }: any) => (
  <div
    className="card border-0 shadow-sm flex-fill"
    style={{ backgroundColor: bgColor, borderRadius: "12px" }}
  >
    <div className="card-body d-flex justify-content-between align-items-center p-4">
      <div>
        <small className="text-muted fw-semibold d-block mb-1">{title}</small>
        <h2 className="mb-0 fw-bold">{count}</h2>
      </div>
      <div className="p-3 rounded-3" style={{ backgroundColor: color + "20" }}>
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
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DashboardRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
    loadLookupData();
  }, [selectedDate]); // Reload when date changes

  const loadData = async () => {
    try {
      const data = await invoke<DashboardRecord[]>("get_dashboard_data", { date: selectedDate });
      setRecords(data);
    } catch (err) {
      console.error(err);
      await message("Erro ao carregar dados: " + err, {
        title: "Erro",
        kind: "error",
      });
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
      await message(res as string, { title: "Sucesso", kind: "info" });
    } catch (err) {
      await message(err as string, { title: "Erro", kind: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm(
      "Tem certeza que deseja excluir este registro?",
      { title: "Confirmar Exclusão", kind: "warning" },
    );
    if (!confirmed) return;

    try {
      await invoke("delete_record_by_id", { id });
      loadData();
      await message("Registro excluído com sucesso.", {
        title: "Sucesso",
        kind: "info",
      });
    } catch (err) {
      await message("Erro ao excluir: " + err, {
        title: "Erro",
        kind: "error",
      });
    }
  };

  const handleUpdate = async (
    record: DashboardRecord,
    field: string,
    value: string | number,
  ) => {
    // If updating ID fields (from selects), ensure value is parsed to int. 
    // If updating text fields (observation), keep as string.
    const parsedValue = typeof value === 'string' && field !== 'observation' ? parseInt(value) : value;

    const updatedRecord = { ...record, [field]: parsedValue };

    // Optimistic update
    setRecords(
      records.map((r) =>
        r.id === record.id ? { ...r, [field]: parsedValue } : r,
      ),
    );

    try {
      await invoke("update_existing_record", {
        request: {
          id: updatedRecord.id,
          playerId: updatedRecord.playerId,
          complaintId: updatedRecord.complaintId,
          shiftId: updatedRecord.shiftId,
          treatmentId: updatedRecord.treatmentId,
          statusId: updatedRecord.statusId,
          observation: updatedRecord.observation,
        },
      });
      // Reload to ensure consistency (e.g. if colors need to update based on status)
      loadData();
    } catch (err) {
      await message("Erro ao atualizar: " + err, {
        title: "Erro",
        kind: "error",
      });
      loadData(); // Revert
    }
  };

  const handleEditObservation = (record: DashboardRecord) => {
    setEditingRecord(record);
    setShowObservationModal(true);
  };

  const saveObservation = async (newObservation: string) => {
    if (editingRecord) {
      await handleUpdate(editingRecord, 'observation', newObservation);
      setShowObservationModal(false);
      setEditingRecord(null);
    }
  };

  const totalAtletas = records.length;
  const liberados = records.filter((r) => r.status === "LIBERADO").length;
  const emTransicao = records.filter((r) => r.status === "TRANSIÇÃO").length;
  const noDm = records.filter((r) => r.status === "NO DM").length;

  const filteredRecords = records.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatLongDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const formatted = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);

    return formatted
      .split(" ")
      .map((word) =>
        word.length > 2 ? word.charAt(0).toUpperCase() + word.slice(1) : word,
      )
      .join(" ");
  };

  const renderHeader = () => {
    return (
      <header className="d-flex justify-content-between align-items-center py-3 px-4 bg-white border-bottom">
        <div>
          <h4 className="mb-0 fw-bold">Dashboard</h4>
          <small className="text-muted">
            Visão geral do departamento médico
          </small>
        </div>

        <div className="d-flex align-items-center gap-4">
          <div className="position-relative">
            <Search
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
              size={18}
            />
            <input
              type="text"
              className="form-control ps-5 bg-light border-0"
              placeholder="Buscar atleta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "300px", borderRadius: "8px" }}
            />
          </div>

          <div className="d-flex align-items-center text-muted position-relative">
            <Calendar className="me-2" size={18} />
            <small className="fw-semibold">
              {formatLongDate(selectedDate)}
            </small>
            <input 
              type="date" 
              className="position-absolute w-100 h-100 opacity-0" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ cursor: 'pointer', left: 0, top: 0 }}
              title="Selecionar Data"
            />
          </div>

          <div className="position-relative">
            <Bell size={20} className="text-muted" />
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style={{ fontSize: "0.6rem" }}
            >
              2
            </span>
          </div>
        </div>
      </header>
    );
  };

  return (
    <>
      {renderHeader()}

      <div className="p-4 bg-light" style={{ minHeight: "calc(100vh - 80px)" }}>
        <div className="d-flex gap-4 mb-5">
          <SummaryCard
            title="Total de Atletas"
            count={totalAtletas}
            icon={Users}
            color="#6366F1"
            bgColor="white"
          />
          <SummaryCard
            title="Liberados"
            count={liberados}
            icon={CheckCircle}
            color="#10B981"
            bgColor="#ECFDF5"
          />

          <SummaryCard
            title="Em Transição"
            count={emTransicao}
            icon={Activity}
            color="#F59E0B"
            bgColor="#FFFBEB"
          />
          <SummaryCard
            title="No DM"
            count={noDm}
            icon={AlertCircle}
            color="#EF4444"
            bgColor="#FEF2F2"
          />
        </div>

        <div
          className="card border-0 shadow-sm"
          style={{ borderRadius: "16px" }}
        >
          <div className="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 fw-bold">Relatório do Dia</h5>
              <small className="text-muted">
                {totalAtletas} registros hoje
              </small>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary d-flex align-items-center px-3"
                style={{ borderRadius: "8px" }}
                onClick={handleExportPDF}
              >
                <FileDown size={18} className="me-2" />
                Exportar PDF
              </button>
              <button
                className="btn btn-dark d-flex align-items-center px-3"
                style={{ borderRadius: "8px", backgroundColor: "#1a233a" }}
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
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-top">
                    <td className="ps-4 py-3 border-0">
                      <div className="d-flex align-items-center">
                        <div
                          className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: "40px",
                            height: "40px",
                            fontWeight: "bold",
                          }}
                        >
                          {record.id}
                        </div>
                        <div>
                          <select
                            className="form-select border-0 bg-transparent fw-bold p-0 select-inline"
                            value={record.playerId}
                            onChange={(e) =>
                              handleUpdate(record, "playerId", e.target.value)
                            }
                            aria-label="Selecionar Atleta"
                          >
                            {lookupData?.players.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                          <small className="text-muted d-block">
                            {record.position}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 border-0">
                      <select
                        className="form-select border-0 bg-transparent p-0 select-inline"
                        value={record.complaintId}
                        onChange={(e) =>
                          handleUpdate(record, "complaintId", e.target.value)
                        }
                        aria-label="Selecionar Queixa"
                      >
                        {lookupData?.complaints.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 border-0">
                      <select
                        className="form-select border-0 bg-transparent p-0 select-inline"
                        value={record.shiftId}
                        onChange={(e) =>
                          handleUpdate(record, "shiftId", e.target.value)
                        }
                        aria-label="Selecionar Período"
                      >
                        {lookupData?.shifts.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 border-0">
                      <select
                        className="form-select border-0 bg-transparent p-0 select-inline"
                        value={record.treatmentId}
                        onChange={(e) =>
                          handleUpdate(record, "treatmentId", e.target.value)
                        }
                        aria-label="Selecionar Tratamento"
                      >
                        {lookupData?.treatments.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 border-0">
                      <div className="position-relative">
                        <select
                          className="form-select border-0 bg-transparent p-0 ps-3 fw-bold select-inline"
                          value={record.statusId}
                          onChange={(e) =>
                            handleUpdate(record, "statusId", e.target.value)
                          }
                          style={{ color: record.statusColor }}
                          aria-label="Selecionar Status"
                        >
                          {lookupData?.status.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <span
                          className="position-absolute rounded-circle"
                          style={{
                            width: "8px",
                            height: "8px",
                            backgroundColor: record.statusColor,
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                          }}
                        ></span>
                      </div>
                    </td>
                    <td
                      className="py-3 border-0 text-muted small"
                      style={{
                        maxWidth: "200px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {record.observation}
                    </td>
                    <td className="pe-4 py-3 border-0 text-end">
                      <Dropdown align="end">
                        <Dropdown.Toggle
                          variant="link"
                          className="text-muted p-0 border-0"
                          id={`dropdown-${record.id}`}
                        >
                          <MoreVertical size={18} />
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() => handleEditObservation(record)}
                            className="d-flex align-items-center"
                          >
                            <Pencil size={14} className="me-2" />
                            Editar observação
                          </Dropdown.Item>
                          <Dropdown.Item
                            className="text-danger d-flex align-items-center"
                            onClick={() => handleDelete(record.id)}
                          >
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

        <ObservationModal
          show={showObservationModal}
          onHide={() => setShowObservationModal(false)}
          onSave={saveObservation}
          initialObservation={editingRecord?.observation || ""}
        />
      </div>
    </>
  );
};

export default Dashboard;
