'use client';

import React, { useState, useEffect } from 'react';
import { Download, Trash2, Eye, Server, RefreshCw } from 'lucide-react';
import apiClient from '@/api/client';

interface AuditLog {
  id: string;
  userEmail: string;
  action: string;
  resource: string;
  ip: string;
  createdAt: string;
  status: 'SUCCESS' | 'FAILED';
  description: string;
}

export default function AuditAdminPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/audit');
      setLogs(response.data.data || []);
    } catch (err) {
      console.error('Error al traer logs de auditoría:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Handlers para interactuar con tus endpoints del backend
  const exportFile = (type: 'csv' | 'json') => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4586/api/v1'}/audit/export-${type}`, '_blank');
  };

  const handlePurge = async () => {
    if (confirm('⚠️ ¿Está absolutamente seguro de purgar TODOS los registros de auditoría? Esta acción es irreversible.')) {
      try {
        await apiClient.delete('/audit/purge');
        fetchLogs();
        alert('Historial purgado con éxito.');
      } catch (err) {
        alert('Error al purgar los registros.');
      }
    }
  };

  const viewDetail = async (id: string) => {
    try {
      const response = await apiClient.get(`/audit/${id}`);
      setSelectedLog(response.data);
    } catch (err) {
      alert('No se pudo cargar el detalle del log.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Logs de Auditoría</h1>
          <p className="text-xs text-gray-500">Trazabilidad legal y forense de todas las acciones del sistema corporativo.</p>
        </div>
        
        {/* Panel de Botones Operativos */}
        <div className="flex flex-wrap gap-2">
          <button onClick={fetchLogs} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /></button>
          <button onClick={() => exportFile('json')} className="bg-white border border-gray-200 text-gray-700 font-medium text-xs px-3 py-2 rounded-lg flex items-center space-x-1.5 hover:bg-gray-50"><Download size={14} /> <span>JSON</span></button>
          <button onClick={() => exportFile('csv')} className="bg-white border border-gray-200 text-gray-700 font-medium text-xs px-3 py-2 rounded-lg flex items-center space-x-1.5 hover:bg-gray-50"><Download size={14} /> <span>CSV</span></button>
          <button onClick={handlePurge} className="bg-red-50 text-red-700 border border-red-200 font-medium text-xs px-3 py-2 rounded-lg flex items-center space-x-1.5 hover:bg-red-100 transition-colors"><Trash2 size={14} /> <span>Purgar Logs</span></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla principal (Ocupa 2 columnas si hay detalle seleccionado) */}
        <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm lg:col-span-2`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Evento / Usuario</th>
                <th className="px-4 py-3">Recurso</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha y Hora</th>
                <th className="px-4 py-3 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs text-gray-600">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-900 font-mono text-[11px]">{log.action}</div>
                    <div className="text-[10px] text-gray-400">{log.userEmail || 'Sistema/Anónimo'}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{log.resource}</td>
                  <td className="px-4 py-3">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{log.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => viewDetail(log.id)} className="p-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"><Eye size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Panel Lateral de Detalle del Registro */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-fit space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-1.5 border-b border-gray-100 pb-2">
            <Server size={14} className="text-blue-900" />
            <span>Inspector de Metadatos</span>
          </h3>
          {selectedLog ? (
            <div className="space-y-3 text-xs">
              <div><span className="font-semibold text-gray-400 block text-[10px] uppercase">Descripción</span><p className="text-gray-800 bg-gray-50 p-2 rounded mt-1">{selectedLog.description}</p></div>
              <div><span className="font-semibold text-gray-400 block text-[10px] uppercase">Dirección IP</span><p className="font-mono text-gray-700 mt-0.5">{selectedLog.ip || 'Local/Worker'}</p></div>
              <div>
                <span className="font-semibold text-gray-400 block text-[10px] uppercase mb-1">Carga útil (JSON Diff)</span>
                <pre className="p-3 bg-slate-900 text-amber-400 rounded-lg text-[10px] font-mono overflow-x-auto max-h-48 shadow-inner">
                  {JSON.stringify({ oldData: selectedLog.oldData, newData: selectedLog.newData }, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-xs">Seleccione un registro usando el icono del ojo para inspeccionar los datos profundos de auditoría de Prisma.</div>
          )}
        </div>
      </div>
    </div>
  );
}