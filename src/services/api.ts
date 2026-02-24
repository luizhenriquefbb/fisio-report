import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787/api";

const request = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  } as any;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.reload(); // Force reload to show login screen
    throw new Error("Unauthorized");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unknown error");
  }
  return data;
};

export const api = {
  login: (creds: any) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(creds) }),
  register: (creds: any) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(creds) }),

  // Dashboard
  getDashboardData: (date: string) => request(`/dashboard?date=${date}`),
  getLookupOptions: () => request("/lookup"),

  // Records
  createRecord: (data: any) =>
    request("/records", { method: "POST", body: JSON.stringify(data) }),
  updateRecord: (data: any) =>
    request(`/records/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteRecord: (id: number) => request(`/records/${id}`, { method: "DELETE" }),

  // Players
  getPlayers: () => request("/players"),
  createPlayer: (data: any) =>
    request("/players", { method: "POST", body: JSON.stringify(data) }),
  updatePlayer: (data: any) =>
    request(`/players/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deletePlayer: (id: number) => request(`/players/${id}`, { method: "DELETE" }),

  // Complaints
  getComplaints: () => request("/complaints"),
  createComplaint: (data: any) =>
    request("/complaints", { method: "POST", body: JSON.stringify(data) }),
  updateComplaint: (data: any) =>
    request(`/complaints/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteComplaint: (id: number) =>
    request(`/complaints/${id}`, { method: "DELETE" }),

  // Shifts
  getShifts: () => request("/shifts"),
  createShift: (data: any) =>
    request("/shifts", { method: "POST", body: JSON.stringify(data) }),
  updateShift: (data: any) =>
    request(`/shifts/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteShift: (id: number) => request(`/shifts/${id}`, { method: "DELETE" }),

  // Treatments
  getTreatments: () => request("/treatments"),
  createTreatment: (data: any) =>
    request("/treatments", { method: "POST", body: JSON.stringify(data) }),
  updateTreatment: (data: any) =>
    request(`/treatments/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteTreatment: (id: number) =>
    request(`/treatments/${id}`, { method: "DELETE" }),

  // Reports
  getReports: (dateFilter?: string) =>
    request(dateFilter ? `/reports?date=${dateFilter}` : "/reports"),
  getReportStatistics: () => request("/reports/stats"),
  generateReportPdf: async (data: {
    date: string;
    therapists: string[];
    finalNotes?: string;
  }) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/generate-report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate PDF");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Relatorio_Fisio_${data.date}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
} as const;

export function useApi() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const call = async (apiFunc: (...args: any[]) => Promise<any>, ...params: any[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiFunc(...params);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, call };
}
