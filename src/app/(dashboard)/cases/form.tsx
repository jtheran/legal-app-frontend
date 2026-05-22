'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/api/client';
import { Scale, Save, X, RefreshCw, FolderPlus } from 'lucide-react';

interface ClientShort {
  id: string;
  name: string;
  dni: string;
}

interface CaseFormProps {
  caseId?: string; // Si está presente, opera en modo edición (PUT)
}

export default function CaseForm({ caseId }: CaseFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get('clientId');

  const [clients, setClients] = useState<ClientShort[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(!!caseId);
  
  const [formData, setFormData] = useState({
    title: '',
    radicado: '',
    description: '',
    status: 'ACTIVO',
    clientId: preselectedClientId || ''
  });

  // Cargar lista de clientes para el selector de vinculación
  useEffect(() => {
    apiClient.get('/clients')
      .then(res => setClients(res.data.data || res.data))
      .catch(() => console.error('Error al cargar catálogo de clientes.'));

    if (caseId) {
      apiClient.get(`/cases/${caseId}`)
        .then(res => {
          const data = res.data.data || res.data;
          setFormData({
            title: data.title,
            radicado: data.radicado,
            description: data.description || '',
            status: data.status,
            clientId: data.clientId || data.client?.id || ''
          });
        })
        .catch(() => {
          alert('Error al recuperar el expediente judicial.');
          router.push('/dashboard/cases');
        })
        .finally(() => setFetchingData(false));
    }
  }, [caseId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) {
      alert('Debes asociar un cliente poderdante a este expediente.');
      return;
    }
    
    setLoading(true);
    try {
      if (caseId) {
        await apiClient.put(`/cases/${caseId}`, formData);
        alert('Expediente actualizado correctamente.');
      } else {
        await apiClient.post('/cases', formData);
        alert('Nuevo expediente judicial radicado.');
      }
      router.push('/dashboard/cases');
      router.refresh();
    } catch (error) {
      alert('Error al guardar el proceso. Verifica que el radicado no esté duplicado.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return <div className="p-6 text-sm text-slate-400 flex items-center gap-2"><RefreshCw className="animate-spin" /> Extrayendo folios del expediente...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white border border-slate-200 p-6 rounded-xl shadow-xs space-y-4">
      <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
        <Scale size={20} className="text-blue-600" /> 
        {caseId ? `Editar Expediente Rad. ${formData.radicado}` : 'Radicar Nuevo Proceso Judicial'}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Título / Carátula del Caso</label>
          <input 
            type="text" 
            required 
            placeholder="Ej: Ejecutivo de Alimentos vs Perez"
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Código de Radicado (23 dígitos)</label>
          <input 
            type="text" 
            required 
            placeholder="Ej: 11001400300720260012300"
            value={formData.radicado} 
            onChange={e => setFormData({...formData, radicado: e.target.value})} 
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Cliente / Poderdante</label>
          <select 
            value={formData.clientId} 
            onChange={e => setFormData({...formData, clientId: e.target.value})}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white outline-none"
          >
            <option value="">-- Seleccionar Titular --</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.dni})</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Estado Procesal</label>
          <select 
            value={formData.status} 
            onChange={e => setFormData({...formData, status: e.target.value})}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white outline-none"
          >
            <option value="ACTIVO">Activo / En Curso</option>
            <option value="SUSPENDIDO">Suspendido / Términos Parados</option>
            <option value="ARCHIVADO">Archivado / Sentencia Firme</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Notas de Oficina / Descripción Preliminar</label>
        <textarea 
          rows={4}
          placeholder="Anotaciones sobre el juzgado de origen, medidas cautelares pendientes o pretensiones del litigio..."
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})} 
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
        />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
        <button type="button" onClick={() => router.back()} className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50">
          <X size={16} /> Cancelar
        </button>
        <button type="submit" disabled={loading} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm disabled:opacity-60">
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} 
          {caseId ? 'Actualizar Historial' : 'Radicar Caso'}
        </button>
      </div>
    </form>
  );
}