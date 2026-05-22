'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/api/client';
import { UserPlus, Save, X, RefreshCw } from 'lucide-react';

interface ClientFormProps {
  clientId?: string; // Si viene, opera como actualización (PUT)
}

export default function ClientForm({ clientId }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', dni: '', email: '', phone: '' });

  useEffect(() => {
    if (clientId) {
      // Modo Edición: Recuperamos los valores actuales
      apiClient.get(`/clients/${clientId}`)
        .then(res => {
          const data = res.data.data || res.data;
          setFormData({ name: data.name, dni: data.dni, email: data.email, phone: data.phone || '' });
        })
        .catch(() => alert('Error al consultar datos del cliente.'));
    }
  }, [clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (clientId) {
        await apiClient.put(`/clients/${clientId}`, formData);
        alert('Datos del poderdante actualizados.');
      } else {
        await apiClient.post('/clients', formData);
        alert('Nuevo cliente registrado.');
      }
      router.push('/dashboard/clients');
      router.refresh();
    } catch (error) {
      alert('Error al guardar el registro. Comprueba que el DNI o Email no estén duplicados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white border p-6 rounded-xl shadow-xs space-y-4">
      <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <UserPlus size={20} className="text-blue-600" /> {clientId ? 'Modificar Ficha de Cliente' : 'Registrar Nuevo Cliente'}
      </h1>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Nombre Completo o Razón Social</label>
        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Documento (DNI / NIT)</label>
          <input type="text" required disabled={!!clientId} value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm disabled:bg-slate-50 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Teléfono / Celular</label>
          <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Correo Electrónico Corporativo/Personal</label>
        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={() => router.back()} className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"><X size={16} /> Cancelar</button>
        <button type="submit" disabled={loading} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm disabled:opacity-60">
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} {clientId ? 'Guardar Cambios' : 'Registrar'}
        </button>
      </div>
    </form>
  );
}