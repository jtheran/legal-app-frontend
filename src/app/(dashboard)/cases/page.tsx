'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Search, Plus, Eye, Trash2, Scale, Calendar, User, FileText, Edit } from 'lucide-react';

interface Case {
  id: string;
  title: string;
  radicado: string;
  status: string;
  createdAt: string;
  client?: {
    name: string;
  };
}

export default function CasesListPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCases = async (query = '') => {
    setLoading(true);
    try {
      const response = await apiClient.get('/cases', { params: { search: query } });
      setCases(response.data.data || response.data);
    } catch (error) {
      console.error('Error al consultar expedientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCases(); }, []);

  const handleDelete = async (id: string, radicado: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el radicado ${radicado}? Esta acción borrará todas las actuaciones asociadas.`)) return;
    try {
      await apiClient.delete(`/cases/${id}`);
      setCases(cases.filter(c => c.id !== id));
    } catch (error) {
      alert('Error al suprimir el registro de la base jurídica.');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVO': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SUSPENDIDO': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Scale className="text-blue-600" size={22} /> Control de Procesos Judiciales
          </h1>
          <p className="text-xs text-slate-400">Panel unificado de radicación, consulta de estados y gestión de poderdantes.</p>
        </div>
        <Link href="/dashboard/cases/new" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs">
          <Plus size={16} /> Radicar Expediente
        </Link>
      </div>

      {/* Caja de Filtrado */}
      <div className="flex gap-2 max-w-sm border p-1 rounded-lg bg-white shadow-xs">
        <input 
          type="text" 
          placeholder="Buscar por radicado o título..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && fetchCases(search)} 
          className="w-full pl-2 text-xs outline-none" 
        />
        <button onClick={() => fetchCases(search)} className="bg-slate-800 text-white p-2 rounded-md hover:bg-slate-900">
          <Search size={14} />
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400 animate-pulse flex items-center gap-2"><Scale className="animate-spin" /> Inspeccionando archivos judiciales...</div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Carátula / Radicado</th>
                <th className="p-3.5">Cliente / Demandante</th>
                <th className="p-3.5">F. Registro</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {cases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">No se encontraron expedientes que coincidan con la búsqueda.</td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-3.5">
                      <Link href={`/dashboard/cases/${c.id}`} className="font-semibold text-slate-900 hover:text-blue-600 block mb-0.5">{c.title}</Link>
                      <span className="font-mono text-slate-400 block text-[11px]">{c.radicado}</span>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      <div className="flex items-center gap-1"><User size={13} className="text-slate-400" /> {c.client?.name || 'No vinculado'}</div>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      <div className="flex items-center gap-1"><Calendar size={13} className="text-slate-400" /> {new Date(c.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 font-medium rounded-full border text-[10px] ${getStatusStyle(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <Link href={`/dashboard/cases/${c.id}`} className="p-1 inline-flex items-center gap-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Ver Detalles">
                        <Eye size={14} />
                      </Link>
                      <Link href={`/dashboard/cases/edit/${c.id}`} className="p-1 inline-flex items-center gap-1 text-slate-600 hover:bg-slate-100 rounded-md transition-colors" title="Editar Parámetros">
                        <Edit size={14} />
                      </Link>
                      <button onClick={() => handleDelete(c.id, c.radicado)} className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Eliminar Proceso">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}