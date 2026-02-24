import { useState, useEffect } from "react";
import { api, useApi } from "../services/api";
import { message } from "../services/dialog";
import { FileText, Download } from "lucide-react";
import CustomDatePicker from "../components/CustomDatePicker";
import LoadingSpinner from "../components/loadingSpinner";

interface ReportSummary {
  date: string;
  count: number;
}

interface ReportStats {
  reportsThisMonth: number;
  totalRecords: number;
  averagePerDay: number;
}

const Reports = () => {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [filterDate, setFilterDate] = useState("");
  const { isLoading, call } = useApi();

  useEffect(() => {
    loadReports();
    loadStats();
  }, [filterDate]);

  const loadReports = async () => {
    try {
      const data = await api.getReports(filterDate || undefined);
      setReports(data as ReportSummary[]);
    } catch (err: any) {
      console.error(err);
      await message(err.message || "Erro ao carregar relatórios", {
        title: "Erro",
        kind: "error",
      });
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getReportStatistics();
      setStats(data as ReportStats);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDownloadPDF = async (date: string) => {
    try {
      await call(api.generateReportPdf, {
        date,
        // hardcoded data for demonstration
        therapists: [
          "Márcio Quirino",
          "Carlos Eduardo",
          "Otávio Nascimento",
          "Kaio Oliveira",
        ],
        finalNotes: "RELATÓRIO DA MASSAGEM\n\nMassoterapeuta: Paulo",
      });
    } catch (err: any) {
      console.error(err);
      await message(err.message || "Erro ao gerar PDF", {
        title: "Erro",
        kind: "error",
      });
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "long",
    }).format(date);
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div
        className="p-3 p-md-4 bg-light"
        style={{ minHeight: "calc(100vh - 80px)" }}
      >
        <div className="row g-4 mb-5">
          {/* Generate Report Card */}
          <div className="col-12 col-lg-8">
            <div
              className="card border-0 shadow-sm h-100"
              style={{ borderRadius: "16px" }}
            >
              <div className="card-body p-4">
                <h5 className="fw-bold mb-1">Gerar Relatório</h5>
                <p className="text-muted small mb-4">
                  Selecione uma data para gerar ou visualizar o relatório
                </p>

                <div className="d-flex flex-column flex-sm-row gap-3 align-items-stretch align-items-sm-center mt-4 pt-2">
                  <CustomDatePicker
                    value={filterDate}
                    onChange={setFilterDate}
                    placeholder="Selecionar data"
                    clearable
                    className="w-100 w-sm-auto"
                  />
                  <button
                    className="btn btn-primary d-flex align-items-center justify-content-center px-4 py-2"
                    style={{
                      borderRadius: "10px",
                      backgroundColor: "#8ea1bd",
                      borderColor: "#8ea1bd",
                    }}
                    onClick={loadReports}
                    disabled={isLoading}
                  >
                    <FileText size={18} className="me-2" />
                    Gerar Relatório
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="col-12 col-lg-4">
            <div
              className="card border-0 shadow-sm h-100"
              style={{ borderRadius: "16px" }}
            >
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Estatísticas</h5>

                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Relatórios este mês</span>
                  <span className="fw-bold">
                    {stats?.reportsThisMonth || 0}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Total de registros</span>
                  <span className="fw-bold">{stats?.totalRecords || 0}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Média por dia</span>
                  <span className="fw-bold">{stats?.averagePerDay || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports List */}
        <h5 className="fw-bold mb-4">Relatórios Recentes</h5>
        <div
          className="card border-0 shadow-sm"
          style={{ borderRadius: "16px" }}
        >
          <div className="card-body p-0">
            {reports.map((report, index) => (
              <div
                key={report.date}
                className={`d-flex justify-content-between align-items-center p-4 ${index !== reports.length - 1 ? "border-bottom" : ""}`}
              >
                <div className="d-flex align-items-center">
                  <div className="p-3 rounded-3 bg-light me-3">
                    <FileText size={24} className="text-muted" />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">
                      Relatório - {formatDateLabel(report.date)}
                    </h6>
                    <small className="text-muted">
                      {report.count} registros
                    </small>
                  </div>
                </div>
                <button
                  className="btn btn-link text-decoration-none text-dark d-flex align-items-center fw-medium"
                  onClick={() => handleDownloadPDF(report.date)}
                  disabled={isLoading}
                >
                  <Download size={18} className="me-2" />
                  Baixar PDF
                </button>
              </div>
            ))}
            {reports.length === 0 && (
              <div className="text-center py-5 text-muted">
                Nenhum relatório encontrado para esta data.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;
