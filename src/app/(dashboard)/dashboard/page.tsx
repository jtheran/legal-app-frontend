'use client';

import React, { useState, useEffect } from 'react';
import { 
  Scale, Users, Briefcase, Calendar, FileText, 
  TrendingUp, BarChart3, Loader2, AlertCircle, RefreshCw 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import apiClient from '@/api/client';

// ── INTERFACES DE DATOS ──────────────────────────────────────────────────
interface DashboardStats {
  courtsCount: number;
  clientsCount: number;
  casesCount: number;
  eventsCount: number;
  documentsCount: number;
}

interface ChartDataPoint {
  name: string;
  cantidad: number;
}

export default function DashboardAdminPage() {
  const [stats, setStats] = useState<DashboardStats>({
    courtsCount: 0,
    clientsCount: 0,
    casesCount: 0,
    eventsCount: 0,
    documentsCount: 0,
  });
  
  const [barChartData, setBarChartData] = useState<ChartDataPoint[]>([]);
  const [pieChartData, setPieChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── EXTRACCIÓN Y PROCESAMIENTO DE DATOS ─────────────────────────────────
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Peticiones concurrentes en paralelo para optimizar velocidad del Core
      const [
        courtsRes, 
        clientsRes, 
        casesRes, 
        eventsRes, 
        documentsRes
      ] = await Promise.all([
        apiClient.get('/courts'),
        apiClient.get('/clients'),
        apiClient.get('/cases'),
        apiClient.get('/events'),
        apiClient.get('/document')
      ]);

      // Extracción limpia tolerante a envolturas de API estándar ({ data: [...] })
      const courts = courtsRes.data?.data || courtsRes.data || [];
      const clients = clientsRes.data?.data || clientsRes.data || [];
      const cases = casesRes.data?.data || casesRes.data || [];
      const events = eventsRes.data?.data || eventsRes.data || [];
      const documents = documentsRes.data?.data || documentsRes.data || [];

      setStats({
        courtsCount: courts.length,
        clientsCount: clients.length,
        casesCount: cases.length,
        eventsCount: events.length,
        documentsCount: documents.length,
      });

      // 📊 Mapeo de datos para Gráfica de Barras (Volumetría de Distribución)
      setBarChartData([
        { name: 'Casos', cantidad: cases.length },
        { name: 'Documentos', cantidad: documents.length },
        { name: 'Eventos', cantidad: events.length },
      ]);

      // 🍕 Mapeo de datos para Gráfica de Torta (Ratio de Infraestructura)
      setPieChartData([
        { name: 'Clientes', cantidad: clients.length },
        { name: 'Juzgados', cantidad: courts.length },
      ]);

    } catch (err: any) {
      console.error('Error sincronizando métricas del dashboard:', err);
      setError('Fallo de conexión en la red. No se pudieron consolidar las métricas operativas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Paleta cromática corporativa para el gráfico circular
  const COLORS = ['#1e293b', '#f59e0b'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <Loader2 className="animate-spin text-slate-900" size={32} />
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">Consolidando Cuadro de Mando</p>
          <p className="text-xs text-gray-400">Extrayendo expedientes, juzgados y eventos en tiempo real...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Métricas de la Firma</h1>
          <p className="text-xs text-gray-500">Monitoreo dinámico del ecosistema judicial y carga operativa del bufete.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="bg-white hover:bg-gray-50 text-gray-700 font-medium text-xs px-3 py-2 rounded-lg flex items-center space-x-1.5 border border-gray-200 shadow-sm transition-all active:scale-95"
        >
          <RefreshCw size={12} />
          <span>Sincronizar Datos</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-medium flex items-center space-x-2">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── SECCIÓN 1: TARJETAS DE MÉTRICAS (KPIs) ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* KPI: Casos */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Casos Judiciales</span>
            <span className="text-2xl font-bold text-gray-900 font-mono block">{stats.casesCount}</span>
          </div>
          <div className="p-2 bg-slate-100 rounded-lg text-slate-900">
            <Briefcase size={16} />
          </div>
        </div>

        {/* KPI: Documentos */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Documentos</span>
            <span className="text-2xl font-bold text-gray-900 font-mono block">{stats.documentsCount}</span>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
            <FileText size={16} />
          </div>
        </div>

        {/* KPI: Clientes */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Clientes</span>
            <span className="text-2xl font-bold text-gray-900 font-mono block">{stats.clientsCount}</span>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
            <Users size={16} />
          </div>
        </div>

        {/* KPI: Despachos */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Juzgados / Cortes</span>
            <span className="text-2xl font-bold text-gray-900 font-mono block">{stats.courtsCount}</span>
          </div>
          <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
            <Scale size={16} />
          </div>
        </div>

        {/* KPI: Agenda */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm col-span-2 lg:col-span-1 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Eventos / Citas</span>
            <span className="text-2xl font-bold text-gray-900 font-mono block">{stats.eventsCount}</span>
          </div>
          <div className="p-2 bg-rose-50 rounded-lg text-rose-700">
            <Calendar size={16} />
          </div>
        </div>

      </div>

      {/* ── SECCIÓN 2: GRÁFICAS CORPORATIVAS AVANZADAS ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfica de Distribución de Expedientes (Barras) */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 size={14} className="text-slate-800" />
              <span>Volumetría de Carga Litigiosa</span>
            </h3>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 font-semibold px-2 py-0.5 rounded flex items-center gap-0.5">
              <TrendingUp size={10} /> Live Sync
            </span>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#9ca3af" tickLine={false} />
                <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="cantidad" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica de Ratio Estructural (Torta / Pie) */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Scale size={14} className="text-amber-500" />
              <span>Infraestructura Relacional</span>
            </h3>
          </div>
          <div className="h-64 w-full text-xs flex flex-col justify-between">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="cantidad"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ bottom: 0, fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center text-[11px] text-gray-400 italic">
              Balance proporcional entre despachos activos y base de clientes.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}