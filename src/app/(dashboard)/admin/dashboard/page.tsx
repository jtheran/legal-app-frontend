"use client"

import React, { useState, useEffect } from 'react';
import apiClient from '@/api/client';
import { 
  Users, Briefcase, Mail, FileText, Bell, 
  Cpu, HardDrive, Activity, RefreshCw, Server 
} from 'lucide-react';

// Interfaz para TypeScript basada en tu JSON de respuesta
interface StatsData {
  timestamp: string;
  platform: {
    users: { total: number; active: number; newToday: number; newThisMonth: number };
    events: { total: number; createdToday: number; thisWeek: number; upcoming: number; cancelled: number };
    notifications: { total: number; unread: number; sentToday: number };
    documents: { total: number; uploadedToday: number; uploadedThisMonth: number };
    emails: { queued: number; sentToday: number };
  };
  system: {
    cpu: { usage: number; userLoad: number; systemLoad: number; cores: number; model: string; temperature: number };
    memory: { total: string; used: string; free: string; usagePercent: number; swap: { total: string; used: string } };
    disk: Array<{ mount: string; type: string; total: string; used: string; free: string; usagePercent: number }>;
    network: Array<{ interface: string; rxSec: string; txSec: string; rxTotal: string; txTotal: string }>;
    processes: { total: number; running: number; blocked: number; sleeping: number };
    uptime: { seconds: number; formatted: string; nodeVersion: string; platform: string; arch: string; hostname: string };
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/maintenance/stats');
        setStats(response.data);
        
      } catch (error) {
        console.error("Error cargando métricas", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500 text-sm gap-2">
        <RefreshCw size={18} className="animate-spin text-blue-500" /> Cargando métricas en tiempo real...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen text-slate-800">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Server size={22} className="text-slate-700" /> Mantenimiento y Estadísticas Globales
          </h1>
          <p className="text-xs text-slate-400 font-mono">Host: {stats.system.uptime.hostname} ({stats.system.uptime.platform})</p>
        </div>
        <div className="text-right text-[11px] text-slate-400 bg-white border border-slate-100 shadow-sm px-3 py-1.5 rounded-lg">
          <span className="font-semibold block text-slate-500">Uptime del Servidor</span>
          <span className="font-mono text-slate-700">{stats.system.uptime.formatted}</span>
        </div>
      </div>

      {/* SECCIÓN 1: MÉTRICAS DE PLATAFORMA (KPIs Operativos) */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Métricas de la Plataforma</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Usuarios */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase">Usuarios Totales</p>
              <p className="text-xl font-bold text-slate-800 font-mono mt-0.5">{stats.platform.users.total}</p>
              <span className="text-[10px] text-emerald-600 font-medium">+{stats.platform.users.newToday} hoy</span>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><Users size={18} /></div>
          </div>

          {/* Eventos / Casos */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase">Casos / Eventos</p>
              <p className="text-xl font-bold text-slate-800 font-mono mt-0.5">{stats.platform.events.total}</p>
              <span className="text-[10px] text-slate-400">Próximos: {stats.platform.events.upcoming}</span>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><Briefcase size={18} /></div>
          </div>

          {/* Documentos */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase">Documentos</p>
              <p className="text-xl font-bold text-slate-800 font-mono mt-0.5">{stats.platform.documents.total}</p>
              <span className="text-[10px] text-blue-500">+{stats.platform.documents.uploadedToday} hoy</span>
            </div>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg"><FileText size={18} /></div>
          </div>

          {/* Notificaciones */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase">Notificaciones</p>
              <p className="text-xl font-bold text-slate-800 font-mono mt-0.5">{stats.platform.notifications.total}</p>
              <span className="text-[10px] text-amber-600 font-medium">{stats.platform.notifications.unread} sin leer</span>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg"><Bell size={18} /></div>
          </div>

          {/* Emails */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase">Emails Salientes</p>
              <p className="text-xl font-bold text-slate-800 font-mono mt-0.5">{stats.platform.emails.sentToday}</p>
              <span className="text-[10px] text-red-500 font-medium">Cola: {stats.platform.emails.queued}</span>
            </div>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg"><Mail size={18} /></div>
          </div>

        </div>
      </div>

      {/* SECCIÓN 2: RENDIMIENTO EN TIEMPO REAL (Infraestructura) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfica de Accesos simulada / Sección de actividad de procesos */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" /> Monitoreo de Procesos y Red
            </h2>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 font-mono px-2 py-0.5 rounded font-medium">Node {stats.system.uptime.nodeVersion}</span>
          </div>

          {/* Distribución de hilos / procesos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg text-center">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-medium">Hilos Totales</span>
              <span className="text-lg font-bold font-mono text-slate-700">{stats.system.processes.total}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-medium">En Ejecución</span>
              <span className="text-lg font-bold font-mono text-emerald-600">{stats.system.processes.running}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-medium">Bloqueados</span>
              <span className="text-lg font-bold font-mono text-red-500">{stats.system.processes.blocked}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-medium">En Espera</span>
              <span className="text-lg font-bold font-mono text-amber-500">{stats.system.processes.sleeping}</span>
            </div>
          </div>

          {/* Información de Red */}
          <div className="border border-slate-100 p-4 rounded-lg space-y-2">
            <span className="text-xs font-bold text-slate-600 block">Tráfico de Red ({stats.system.network[0].interface})</span>
            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div className="bg-slate-50/50 p-2.5 rounded border border-slate-100">
                <p className="text-slate-400 text-[10px]">VELOCIDAD ACTUAL (Descarga / Carga)</p>
                <p className="text-slate-700 mt-0.5 font-bold">⬇ {stats.system.network[0].rxSec} — ⬆ {stats.system.network[0].txSec}</p>
              </div>
              <div className="bg-slate-50/50 p-2.5 rounded border border-slate-100">
                <p className="text-slate-400 text-[10px]">DATOS TOTALES TRANSFERIDOS</p>
                <p className="text-slate-700 mt-0.5 font-bold">RX: {stats.system.network[0].rxTotal} | TX: {stats.system.network[0].txTotal}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modelo de Hardware y Detalles Adicionales */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-3 mb-3">
              Especificaciones de Instancia
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Procesador</span>
                <p className="text-slate-700 font-medium">{stats.system.cpu.model}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Núcleos lógicos</span>
                  <p className="text-slate-700 font-mono font-bold">{stats.system.cpu.cores} vCPUs</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Arquitectura</span>
                  <p className="text-slate-700 font-mono font-bold">{stats.system.uptime.arch}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-4 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Temperatura Promedio de Cores</span>
            <span className={`text-xl font-mono font-bold ${stats.system.cpu.temperature > 75 ? 'text-red-500' : 'text-green-500'}`}>
              {stats.system.cpu.temperature || 50}°C
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: METRICAS DE HARDWARE (CPU, RAM, DISCO) */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Salud del Servidor</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* CPU */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Cpu size={14} className="text-violet-500" /> Carga Total de CPU
              </span>
              <span className="text-xs font-mono font-bold text-violet-600">{stats.system.cpu.usage}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${stats.system.cpu.usage}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Usuario: {stats.system.cpu.userLoad}%</span>
              <span>Kernel: {stats.system.cpu.systemLoad}%</span>
            </div>
          </div>

          {/* RAM */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <HardDrive size={14} className="text-sky-500" /> Memoria RAM
              </span>
              <span className="text-xs font-mono font-bold text-sky-600">{stats.system.memory.usagePercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: `${stats.system.memory.usagePercent}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Uso: {stats.system.memory.used} de {stats.system.memory.total}</span>
              <span>Swap en Uso: {stats.system.memory.swap.used}</span>
            </div>
          </div>

          {/* Disco Principal */}
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <HardDrive size={14} className="text-amber-500" /> Almacenamiento ({stats.system.disk[0].mount})
              </span>
              <span className="text-xs font-mono font-bold text-amber-600">{stats.system.disk[0].usagePercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${stats.system.disk[0].usagePercent}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Libre: {stats.system.disk[0].free}</span>
              <span>Formato: {stats.system.disk[0].type}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}